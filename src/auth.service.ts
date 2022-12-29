import { Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import {
  encryptPassword,
  generateInviteCode,
  sendMail,
  verifyPassword,
} from './helper/common';
import { issueJwtToken } from './helper/jwtToken';
import { InviteCodesEntity } from './entity/invite_codes.entity';
import {
  invite_code_status,
  invite_code_type,
  user_status,
} from './enums/user';
import { email_templates_contants } from './constants/email';

@Injectable()
export class AuthService {
  public async LoginService(login_details, Response): Promise<any> {
    const email = login_details.email;
    const plain_password = login_details.password;
    const invite_code_repo = getRepository(InviteCodesEntity);
    const user_repo = getRepository(UserEntity);
    try {
      const user = await user_repo
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', { email })
        .andWhere('user.user_status != :blocked', {
          blocked: user_status.blocked,
        })
        .andWhere('user.user_status != :deleted', {
          deleted: user_status.deleted,
        })
        .getOne();
      // const user = await user_repo.findOne({ email });
      if (!user) {
        return Response.status(401).send({
          data: null,
          message: 'The email and password entered are not valid',
        });
      } else if (
        user.user_status === user_status.pending &&
        user.password.length === 0
      ) {
        return Response.status(401).send({
          data: null,
          message: 'The email and password entered are not valid',
        });
      } else if (user.user_status === user_status.pending && user.password) {
        verifyPassword(plain_password, user.password)
          .then(async (is_password_correct) => {
            if (is_password_correct) {
              // Get the code
              invite_code_repo
                .findOne({
                  where: {
                    user_id: user.id,
                  },
                })
                .then((invite_code_details) => {
                  return Response.status(200).send({
                    data: { temp: true, code: invite_code_details.code }, // tells the user has been allocated a temporary password.
                    message: 'Please set password',
                  });
                })
                .catch(() => {
                  return Response.status(500).send({
                    data: null,
                    message: 'Can not find the code',
                  });
                });
            } else {
              Response.status(401).send({
                data: null,
                message: 'The email and password entered are not valid.',
              });
            }
          })
          .catch(() => {
            Response.status(401).send({
              data: null,
              message: 'The email and password entered are not valid.',
            });
          });
      } else if (
        user.user_status === user_status.deleted ||
        user.user_status === user_status.blocked
      ) {
        return Response.status(200).send({
          data: null,
          message: 'The email and password entered are not valid',
        });
      } else {
        const hashed_password = user.password;

        verifyPassword(plain_password, hashed_password)
          .then(async (is_password_correct) => {
            if (is_password_correct) {
              const token = await issueJwtToken(user);
              Response.status(200).send({
                data: {
                  ...user,
                  password: undefined,
                  token,
                },
                message: 'User has been logged in successfully.',
              });
            } else {
              Response.status(401).send({
                data: null,
                message: 'The email and password entered are not valid.',
              });
            }
          })
          .catch(() => {
            Response.status(401).send({
              data: null,
              message: 'The email and password entered are not valid.',
            });
          });
      }
    } catch (e) {
      Response.status(401).send({
        data: null,
        message: 'The email and password entered are not valid',
      });
    }
  }

  public async validateAndSetPasswordService(body, Response): Promise<any> {
    const invite_code = body.code;
    const new_password = body.password;

    const invite_code_repo = getRepository(InviteCodesEntity);
    const user_repo = getRepository(UserEntity);

    invite_code_repo
      .findOne({
        where: {
          code: invite_code,
        },
        relations: ['user'],
      })
      .then(async (invite_code_details) => {
        if (!invite_code_details) {
          return Response.status(400).send({
            data: null,
            message: 'Invalid invite code.',
          });
        } else {
          if (
            invite_code_details.status === invite_code_status.expired &&
            invite_code_details.type === invite_code_type.resetPassword
          ) {
            return Response.status(400).send({
              data: null,
              message: 'Invitation link has been expired.',
            });
          } else if (invite_code_details.status === invite_code_status.used) {
            return Response.status(400).send({
              data: null,
              message: 'Invitation link has already been used.',
            });
          } else {
            if (invite_code_details.type === invite_code_type.setPassword) {
              //set the password, no need to check for expiry of code.
              await savePassword(
                new_password,
                invite_code_details,
                user_repo,
                invite_code_repo,
                Response,
              );
            } else {
              // check for expiry of invite_code
              const current_date = new Date();
              const temp_date = new Date(
                new Date(invite_code_details.createdAt).getTime() +
                  60 * 60 * 24 * 1000,
              ); // createdAt + 24 hours
              if (current_date > temp_date) {
                // set code as expired, return error.
                const invite_code_obj = invite_code_repo.create({
                  id: invite_code_details.id,
                  status: invite_code_status.expired,
                });
                invite_code_repo
                  .save(invite_code_obj)
                  .then(() => {
                    Response.status(401).send({
                      data: null,
                      message: 'The invite code has been expired.',
                    });
                  })
                  .catch(() => {
                    Response.status(500).send({
                      data: null,
                      message: 'Error while updating invite code status',
                    });
                  });
              } else {
                // set code as used and set the password.
                await savePassword(
                  new_password,
                  invite_code_details,
                  user_repo,
                  invite_code_repo,
                  Response,
                );
              }
            }
          }
        }
      })
      .catch(() => {
        Response.status(500).send({
          data: null,
          message: 'Error while fetching invite code.',
        });
      });
  }

  // Service called from forgot password screen
  // Sends email containing reset password link.
  public async forgotPasswordService(body, Response): Promise<any> {
    const email = body.email;

    const user_repo = getRepository(UserEntity);
    const invite_code_repo = getRepository(InviteCodesEntity);

    user_repo
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.user_status != :blocked', {
        blocked: user_status.blocked,
      })
      .andWhere('user.user_status != :deleted', {
        deleted: user_status.deleted,
      })
      .getOne()
      .then(async (user_info) => {
        if (!user_info) {
          // Error should not be thrown if email doesn't exist in our system.
          return Response.status(200).send({
            data: null,
            message: 'User with given email id was not found.',
          });
        } else {
          // Update all code in pending for resetPassword
          const pendingCodes = await invite_code_repo.find({
            where: {
              status: invite_code_status.pending,
              user_id: user_info.id,
              type: invite_code_type.resetPassword,
            },
          });
          if (pendingCodes.length > 0) {
            const updatePendingCodes = pendingCodes.map((pc) => {
              pc.status = invite_code_status.expired;
              return pc;
            });
            try {
              await invite_code_repo.save(updatePendingCodes);
            } catch (err) {
              return Response.status(500).send({
                data: null,
                message: 'Update pending codes error',
              });
            }
          }
          const invite_code = generateInviteCode(
            `${user_info.id.toString()}${new Date().getTime().toString()}`,
          );
          const invite_code_obj = invite_code_repo.create({
            code: invite_code.toString(),
            status: invite_code_status.pending,
            user_id: user_info.id,
            type: invite_code_type.resetPassword,
          });

          invite_code_repo
            .save(invite_code_obj)
            .then(() => {
              // Now send mail
              const reset_password_link = `${process.env.FRONTEND_DOMAIN}${email_templates_contants.frontend_reset_password_url}${invite_code}`;
              const template_name = `${process.env.EMAIL_TEMPLATE_PREFIX}${email_templates_contants.forgot_password}`;
              const data = {
                from: process.env.FROM_EMAIL,
                to: email,
                subject: email_templates_contants.forgot_password_mail_subject,
                template: template_name,
                'h:X-Mailgun-Variables': JSON.stringify({
                  forget_password_link: reset_password_link,
                }),
              };
              sendMail(data)
                .then(() => {
                  return Response.status(200).send({
                    data: null,
                    message: 'Mail has been sent successfully.',
                  });
                })
                .catch((error) => {
                  console.log(error);
                  return Response.status(500).send({
                    data: null,
                    message: 'Error while sending mail.',
                  });
                });
            })
            .catch((error) => {
              console.log(error);
              return Response.status(500).send({
                data: null,
                message: 'Error while generating invite code link',
              });
            });
        }
      })
      .catch(() => {
        return Response.status(500).send({
          data: null,
          message: 'Error while fetching user details.',
        });
      });
  }
}

async function savePassword(
  new_password,
  invite_code_details,
  user_repo,
  invite_code_repo,
  Response,
) {
  return new Promise<void>(async (resolve) => {
    try {
      const hashed_password = await encryptPassword(new_password);
      const user_obj = user_repo.create({
        id: invite_code_details.user.id,
        password: hashed_password.toString(),
        user_status: user_status.actived,
      });
      await user_repo.save(user_obj);
      // Now set the invite code status as 'used'
      const invite_code_obj = invite_code_repo.create({
        id: invite_code_details.id,
        status: invite_code_status.used,
      });
      await invite_code_repo.save(invite_code_obj);
      Response.status(200).send({
        data: null,
        message: 'The password has been updated successfully.',
      });
      resolve();
    } catch (e) {
      Response.status(200).send({
        data: null,
        message: 'Error while updating password .',
      });
    }
  });
}
