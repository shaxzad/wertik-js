import { get } from "lodash";
import convertFiltersIntoSequalizeObject from "./../../framework/database/helpers/convertFiltersIntoSequalizeObject";

export const paginate = async (arg, tableInstance) => {
  let page = get(arg, "pagination.page", 1);
  let limit = get(arg, "pagination.limit", 500);
  let sorting = get(arg, "sorting", []);
  let offset = limit * (page - 1);
  const where = await convertFiltersIntoSequalizeObject(arg.where);
  const find = await tableInstance.findAndCountAll({
    where: where,
    offset: offset,
    limit: limit,
    order: sorting.map((c) => {
      return [c.column, c.type];
    }),
  });
  const totalPages = Math.ceil(find.count / limit);
  return {
    list: find.rows,
    paginationProperties: {
      total: find.count,
      nextPage: page + 1,
      page: page,
      previousPage: page == 1 ? 1 : page - 1,
      pages: totalPages,
      hasMore: page < totalPages,
    },
  };
};

export default function (module, schemaInformation, store) {
  return {
    graphql: {
      generateQueriesCrudSchema() {
        return `

        type ${module.name}List {
            list: [${module.name}]
            pagination: Pagination
            sorting: Sorting
            paginationProperties: PaginationProperties
        }
        type ${module.name}BulkMutationResponse {
            returning: [${module.name}]
            affectedRows: Int
        }
        type Count${module.name} {
            count: Int
        }
        

        extend type Query {
            view${module.name}(where: ${module.name}FilterInput): ${module.name}
            list${module.name}(pagination: PaginationInput, where: ${module.name}FilterInput, sorting: [SortingInput]): ${module.name}List
            count${module.name}(where: ${module.name}FilterInput):  Int
        }`;
      },
      generateMutationsCrudSchema() {
        return `
            extend type Mutation {
              bulkUpdate${module.name}(input: update${module.name}Input,where: ${module.name}FilterInput!): ${module.name}BulkMutationResponse
              bulkCreate${module.name}(input: [create${module.name}Input]): ${module.name}BulkMutationResponse
              bulkDelete${module.name}(where: ${module.name}FilterInput!): SuccessResponse
            }
          `;
      },
      generateCrudResolvers() {
        return {
          Mutation: {
            [`bulkUpdate${module.name}`]: async (_, arg) => {
              const where = await convertFiltersIntoSequalizeObject(arg.where);
              const response = await schemaInformation.tableInstance.update(
                arg.input,
                {
                  where: where,
                }
              );
              const all = await schemaInformation.tableInstance.findAll({
                where: where,
              });
              return {
                returning: all,
                affectedRows: response[0],
              };
            },
            [`bulkDelete${module.name}`]: async (_, arg) => {
              const where = await convertFiltersIntoSequalizeObject(arg.where);
              await schemaInformation.tableInstance.destroy({
                where: where,
              });
              return { message: `${module.name} Deleted` };
            },
            [`bulkCreate${module.name}`]: async (_, arg) => {
              const response = [];
              for (const input of arg.input) {
                response.push(
                  await schemaInformation.tableInstance.create(input)
                );
              }
              return {
                returning: response,
                affectedRows: response.length,
              };
            },
          },
          Query: {
            [`view${module.name}`]: async (_, arg) => {
              const where = await convertFiltersIntoSequalizeObject(arg.where);
              const find = await schemaInformation.tableInstance.findOne({
                where: where,
              });
              return find;
            },
            [`list${module.name}`]: async (_, arg) => {
              return await paginate(arg, schemaInformation.tableInstance);
            },
            [`count${module.name}`]: async (_, arg) => {
              const where = await convertFiltersIntoSequalizeObject(arg.where);
              const count = await schemaInformation.tableInstance.count({
                where: where,
              });
              return count;
            },
          },
        };
      },
    },
  };
}
