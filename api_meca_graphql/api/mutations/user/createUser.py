import graphene
from graphene_django import DjangoObjectType
from api.models import User
from api.types import UserType


class CreateUser(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        username=graphene.String(required=True)
        first_name=graphene.String(required=True)
        last_name=graphene.String(required=True)

    # O tipo de retorno da mutação
    user = graphene.Field(UserType)  # UserType é um DjangoObjectType que você precisa definir para o modelo User

    @staticmethod
    def mutate(root, info, email, password, username, first_name, last_name):
        user = User.objects.create_user(
            email=email,
            password=password,
            username=username,
            first_name=first_name,
            last_name=last_name,
        )
        return CreateUser(user=user)