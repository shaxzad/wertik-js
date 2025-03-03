import { get } from "lodash"
import convertFiltersIntoSequalizeObject from "./convertFiltersIntoSequalizeObject"
import { removeColumnsFromAccordingToSelectIgnoreFields } from "../../helpers/index"
export default async function (model) {
  return function (args, requestedFields: any = []) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!Array.isArray(requestedFields)) {
          throw new Error("Requested fields must be an array")
        }
        let page = get(args, "pagination.page", 1)
        let limit = get(args, "pagination.limit", 500)
        let filters = get(args, "filters", {})
        let sorting = get(args, "sorting", [])
        let offset = limit * (page - 1)
        let convertedFilters = await convertFiltersIntoSequalizeObject(filters)

        requestedFields = removeColumnsFromAccordingToSelectIgnoreFields(
          requestedFields,
          model.selectIgnoreFields
        )

        let mainObject = {
          order: sorting.map((c) => {
            return [c.column, c.type]
          }),
          attributes: requestedFields,
        }
        if (mainObject.attributes.length === 0) {
          delete mainObject["attributes"]
        }
        if (mainObject.order.length == 0) {
          delete mainObject["order"]
        }

        const list = await model.findAndCountAll({
          offset: offset,
          limit: limit,
          where: convertedFilters,
          ...mainObject,
        })

        const totalPages = Math.ceil(list.count / limit)

        resolve({
          filters,
          pagination: { page, limit },
          list: list.rows,
          paginationProperties: {
            total: list.count,
            nextPage: page + 1,
            page: page,
            previousPage: page == 1 ? 1 : page - 1,
            pages: totalPages,
            hasMore: page < totalPages,
          },
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}
