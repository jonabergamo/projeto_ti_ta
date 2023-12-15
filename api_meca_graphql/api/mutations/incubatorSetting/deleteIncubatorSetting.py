import graphene
from api.types import IncubatorSettingType
from api.models import IncubatorSetting

class DeleteIncubatorSetting(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    # O tipo de retorno da mutação
    # Pode ser apenas um campo indicando o sucesso da operação
    success = graphene.Boolean()

    @staticmethod
    def mutate(root, info, id):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        try:
            incubator_setting = IncubatorSetting.objects.get(pk=id)
            incubator_setting.delete()
            return DeleteIncubatorSetting(success=True)
        except IncubatorSetting.DoesNotExist:
            # Retornar False caso o objeto não exista
            return DeleteIncubatorSetting(success=False)