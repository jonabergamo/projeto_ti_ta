import graphene
import graphql_jwt

class AuthQuery(graphene.ObjectType):
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()