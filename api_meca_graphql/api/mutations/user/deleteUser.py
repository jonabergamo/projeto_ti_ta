import graphene
from api.models import User

class DeleteUser(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    # O tipo de retorno da mutação
    success = graphene.Boolean()

    @staticmethod
    def mutate(root, info, id):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        try:
            user = User.objects.get(pk=id)
            user.delete()
            return DeleteUser(success=True)
        except User.DoesNotExist:
            # Retorna False se o usuário não for encontrado
            return DeleteUser(success=False)