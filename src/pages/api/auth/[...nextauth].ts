import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

//Importando o Client do Fauna
import { fauna } from '../../../services/fauna'
//Para podermos montar nossas Queries do Fauna precisamos importar do Fauna O Query
import { query } from 'faunadb'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const { email } = user
      try {
        //Query do Fauna para salvarmos os dados do user
        await fauna.query(
          query.If(
            query.Not(
              query.Exists(
                query.Match(
                  query.Index('user_by_email'),
                  query.Casefold(user.email),
                ),
              ),
            ),
            query.Create(query.Collection('users'), { data: { email } }),
            query.Get(
              query.Match(
                query.Index('user_by_email'),
                query.Casefold(user.email),
              ),
            ),
          ),
        )
        return true
      } catch {
        return false
      }
    },
  },
})
