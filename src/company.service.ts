import { Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { default_count, default_sort_order } from './constants/pagination';
import { CompanyEntity } from './entity/company.entity';
import { user_role } from './enums/user';

@Injectable()
export class CompanyService {
  public async addCompanyService(body, Response): Promise<any> {
    const company_name = body.name;
    const company_repo = getRepository(CompanyEntity);
    company_repo
      .findOne({
        where: {
          name: company_name,
        },
      })
      .then((company_exists) => {
        if (company_exists) {
          return Response.status(400).send({
            data: null,
            message: 'Company with provided name already exists.',
          });
        } else {
          const company_obj = company_repo.create({
            name: company_name,
          });

          company_repo
            .save(company_obj)
            .then(() => {
              Response.status(201).send({
                data: null,
                message: 'Company has been created successfully.',
              });
            })
            .catch((e) => {
              console.log(e);
              Response.status(500).send({
                data: null,
                message: 'Error while creating new company.',
              });
            });
        }
      })
      .catch((e) => {
        console.log(e);
        Response.status(500).send({
          data: null,
          message: 'Error while fetching company details.',
        });
      });
  }

  public async listCompaniesService(authUser, query, Response): Promise<any> {
    const company_repo = getRepository(CompanyEntity);

    const take =
      query.count != undefined && query.count > 0 ? query.count : default_count;
    const skip =
      query.page != undefined && query.page > 0 ? (query.page - 1) * take : 0;

    let builder = company_repo
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.user_company_role', 'role')
      .take(take)
      .skip(skip);

    if (!authUser.roles.includes(user_role.BUNKER_ADMIN)) {
      builder = builder.where('role.user_id = :user_id', {
        user_id: authUser.id,
      });
    }
    if (query.sortby) {
      let sortOrder = query.sort
        ? query.sort.toUpperCase()
        : default_sort_order;
      builder = builder
        .addSelect(`UPPER("company"."${query.sortby}")`, 'upper_name')
        .orderBy('upper_name', sortOrder);
    } else {
      let sortBy = 'company.createdAt';
      builder = builder.orderBy(sortBy, 'DESC');
    }

    let companies = await builder.getMany();
    const total = await builder.getCount();

    return Response.status(200).send({
      data: {
        list: companies,
        total: total,
      },
      message: 'Success',
    });
  }
}
