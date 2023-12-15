import graphene
from graphql_jwt.shortcuts import get_token
from api.types import UserType
from django.contrib.auth import authenticate


class ObtainJSONWebToken(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    token = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, email, password):
        user = authenticate(request=info.context, email=email, password=password)
        if user is not None:
            return ObtainJSONWebToken(token=get_token(user), user=user)
        raise Exception('Invalid credentials')
