import { get } from "lodash"
export default {
  name: "Email",
  graphql: {
    schema: `
      type Email {
        id: Int
        name: String
        template: String
        from_user_id: Int
        variables: String
        cc: String
        subject: String
        to: String!
        bcc: String
        message_id: String
        created_at: String
        updated_at: String
      }
      type EmailResponse {
        message: String
      }
      input EmailInput {
        name: String
        id: Int
        template: String!
        from_user_id: Int
        variables: JSON
        cc: String
        subject: String!
        to: String!
        bcc: String
      } 
    `,
    mutation: {
      schema: `
        sendEmail(input: EmailInput): Email
      `,
      resolvers: {
        sendEmail: async (_: any, args: any, context: any, info: any) => {
          try {
            const sendEmail = context.wertik.sendEmail
            const send = await sendEmail(args.input)
            return send.databaseInstance
          } catch (e) {
            throw new Error(e)
          }
        },
      },
    },
    query: {
      schema: ``,
      resolvers: {},
    },
  },
  restApi: {
    endpoints: [],
  },
  database: {
    sql: {
      tableName: "email",
      fields: {
        template: {
          type: "String",
        },
        from_user_id: {
          type: "Integer",
        },
        name: {
          type: "String",
        },
        variables: {
          type: "String",
        },
        cc: {
          type: "String",
        },
        subject: {
          type: "String",
        },
        to: {
          type: "String",
        },
        message_id: {
          type: "String",
        },
        bcc: {
          type: "String",
        },
      },
    },
  },
}
