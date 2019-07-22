import getListByPaginationAndFiltersSchema from "./../../../framework/graphql/getListByPaginationAndFiltersSchema"
import getIdName from "./../../../framework/helpers/getIdName"
import { getIdType } from "./../../../framework/helpers/getIdName"

export default `
	type RolePermission {
		${getIdName}: ${getIdType}
		permission: Permission,
		role: Role
		successMessage: String
		successMessageType: String
		statusCode: String
		statusCodeNumber: Int
		created_at: String
		updated_at: String
	}
	${getListByPaginationAndFiltersSchema("RolePermission")}
	input RolePermissionInput {
		${getIdName}: ${getIdType}
		permission: ${getIdType}
		role: ${getIdType}
	}
`;