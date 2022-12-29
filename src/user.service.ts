import { Injectable } from '@nestjs/common';
import { getRepository, Brackets } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { InviteCodesEntity } from './entity/invite_codes.entity';
import { default_count, default_sort_order } from './constants/pagination';
import { encryptPassword, generateInviteCode, sendMail } from './helper/common';
import { verify } from './helper/jwtToken';
import {
  invite_code_status,
  invite_code_type,
  user_role,
  user_status,
} from './enums/user';
import { email_templates_contants } from './constants/email';
import { UserCompanyRoleEntity } from './entity/user_company_role.entity';

@Injectable()
export class UserService {
  public async addUserService(user_body, response): Promise<any> {
    const user_repo = getRepository(UserEntity);
    const hashed_password: any = await encryptPassword(user_body.password);
    const data = {
      first_name: user_body.first_name,
      last_name: user_body.last_name,
      email: user_body.email,
      password: hashed_password,
    };
    if (user_body.status) {
      data['user_status'] = user_body.status;
    }
    const user_obj = user_repo.create(data);
    user_repo
      .createQueryBuilder('user')
      .where('user.email = :email', { email: data.email })
      .andWhere('user.user_status != :blocked', {
        blocked: user_status.blocked,
      })
      .andWhere('user.user_status != :deleted', {
        deleted: user_status.deleted,
      })
      .getOne()
      .then((user_exists) => {
        if (user_exists) {
          return response.status(400).send({
            data: null,
            message: 'User with given email id already exists in the system.',
          });
        } else {
          user_repo
            .save(user_obj)
            .then(() => {
              response.status(201).send({
                data: null,
                message: 'User has been created.',
              });
            })
            .catch(() => {
              response.status(500).send({
                data: null,
                message: 'Error while creating user.',
              });
            });
        }
      })
      .catch(() => {
        response.status(500).send({
          data: null,
          message: 'Error while fetching user.',
        });
      });
  }
  public async getUserInfo(user_id, response): Promise<any> {
    const user_repo = getRepository(UserEntity);
    user_repo
      .findOne({
        where: {
          id: user_id,
        },
        relations: ['user_company_role'],
      })
      .then((user_info) => {
        if (!user_info) {
          return response.status(400).send({
            data: null,
            message: 'User does not exist.',
          });
        } else {
          let isUserBunkerAdmin = false;
          for (let i = 0; i < user_info.user_company_role.length; i++) {
            if (
              user_info.user_company_role[i].role === user_role.BUNKER_ADMIN
            ) {
              isUserBunkerAdmin = true;
              break;
            }
          }
          return response.status(200).send({
            data: {
              ...user_info,
              password: undefined,
              isBunkerAdmin: isUserBunkerAdmin,
            },
            message: 'Success',
          });
        }
      })
      .catch(() => {
        return response.status(500).send({
          data: null,
          message: 'Error while fetching user info.',
        });
      });
  }



  public async getUserData(user_id): Promise<any> {
    const user_repo = getRepository(UserEntity);
    return await user_repo.findOne({
      where: {
        id: user_id,
      },
      relations: ['user_company_role'],
    });
  }

  public async getUserInfoFromLink(body, Response): Promise<any> {
    const code = body.code;
    const invite_code_repo = getRepository(InviteCodesEntity);
    invite_code_repo
      .findOne({
        where: {
          code,
        },
        relations: ['user'],
      })
      .then((invite_code_info) => {
        if (!invite_code_info) {
          return Response.status(400).send({
            data: null,
            message: 'Code not found.',
          });
        } else {
          const data = {
            first_name: invite_code_info.user.first_name,
            last_name: invite_code_info.user.last_name,
            email: invite_code_info.user.email,
          };
          return Response.status(200).send({
            data,
            message: 'Success',
          });
        }
      })
      .catch(() => {
        return Response.status(500).send({
          data: null,
          message: 'Error while fetching invite code details.',
        });
      });
  }

  public async listUsersBunkerAdminService(
    user,
    query,
    Response,
  ): Promise<any> {
    if (!user.roles.length) {
      Response.status(403).send({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      });
    }

    const user_repo = getRepository(UserEntity);
    const take =
      query.count != undefined && query.count > 0 ? query.count : default_count;
    const skip =
      query.page != undefined && query.page > 0 ? (query.page - 1) * take : 0;

    let builder = user_repo
      .createQueryBuilder('user')
      .leftJoinAndMapMany(
        'user.user_company_role',
        'user_company_role',
        'ucr',
        'ucr.user_id = user.id',
      )
      .leftJoinAndMapOne('ucr.company', 'company', 'c', 'c.id = ucr.company_id')
      .where('user.user_status != :status', {
        status: user_status.deleted,
      })
      .take(take)
      .skip(skip);

    if (query.sortby) {
      let sortOrder = query.sort
        ? query.sort.toUpperCase()
        : default_sort_order;
      builder = builder.orderBy('user.' + query.sortby, sortOrder);
    } else {
      builder = builder.orderBy('user.createdAt', 'DESC');
    }

    if (query.search) {
      builder = builder.andWhere(
        new Brackets((qb) => {
          qb.where('user.first_name = :firstName', {
            firstName: query.search,
          }).orWhere('user.last_name = :lastName', {
            lastName: query.search,
          });
        }),
      );
    }
    let users = await builder.getMany();
    const total = await builder.getCount();

    return Response.status(200).send({
      data: {
        list: users,
        total: total,
      },
      message: 'Success',
    });
  }

  public async listUsersService(
    authUser,
    company_id,
    query,
    Response,
  ): Promise<any> {
    if (!authUser.roles.includes(user_role.BUNKER_ADMIN)) {
      let companies = [];
      const user_cmp_role_repo = getRepository(UserCompanyRoleEntity);
      await user_cmp_role_repo
        .find({
          select: ['company_id'],
          where: { user_id: authUser.id },
        })
        .then((roles) => {
          Object.keys(roles).forEach(function (key) {
            if (companies.indexOf(roles[key]['company_id']) < 0) {
              companies.push(roles[key]['company_id']);
            }
          });
        });

      if (!companies.includes(company_id)) {
        Response.status(403).send({
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        });
      }
    }
    const user_repo = getRepository(UserEntity);
    const take =
      query.count != undefined && query.count > 0 ? query.count : default_count;
    const skip =
      query.page != undefined && query.page > 0 ? (query.page - 1) * take : 0;

    let builder = user_repo
      .createQueryBuilder('user')
      .leftJoinAndMapMany(
        'user.user_company_role',
        'user_company_role',
        'ucr',
        'ucr.user_id = user.id',
      )
      .leftJoinAndMapOne('ucr.company', 'company', 'c', 'c.id = ucr.company_id')
      .where('user.user_status != :status', {
        status: user_status.deleted,
      })
      .andWhere('ucr.company_id = :company_id', {
        company_id,
      })
      .take(take)
      .skip(skip);

    if (query.sortby) {
      let sortOrder = query.sort
        ? query.sort.toUpperCase()
        : default_sort_order;
      builder = builder.orderBy('user.' + query.sortby, sortOrder);
    } else {
      builder = builder.orderBy('user.createdAt', 'DESC');
    }

    return Response.status(200).send({
      data: {
        list: users,
        total: total,
      },
      message: 'Success',
    });
  }
}

const generateSetPasswordCode = async (saved_user) => {
  const invite_code = await generateInviteCode(
    `${saved_user.id.toString()}${new Date().getTime().toString()}`,
  );
  const invite_code_repo = getRepository(InviteCodesEntity);
  try {
    const invite_code_obj = invite_code_repo.create({
      code: invite_code.toString(),
      status: invite_code_status.pending,
      user_id: saved_user.id,
      type: invite_code_type.setPassword,
    });
    await invite_code_repo.save(invite_code_obj);
    return invite_code;
  } catch (err) {
    throw new Error('Generate code error');
  }
};

async function sendInviteMail(code, user_body, logged_in_user_name) {
  const invite_link = `${process.env.FRONTEND_DOMAIN}${email_templates_contants.frontend_invite_url}${code}`;
  const template_name = `${process.env.EMAIL_TEMPLATE_PREFIX}${email_templates_contants.invite_user}`;
  const data = {
    from: process.env.FROM_EMAIL,
    to: user_body.email,
    subject: email_templates_contants.invite_mail_subject.replace(
      '{user_name}',
      logged_in_user_name,
    ),
    template: template_name,
    'h:X-Mailgun-Variables': JSON.stringify({
      set_up_password_link: invite_link,
      user_name: logged_in_user_name,
    }),
  };
  sendMail(data)
    .then(() => {
      Promise.resolve('Send set password email successfully');
    })
    .catch(() => {
      throw new Error('Send email error');
    });
}
