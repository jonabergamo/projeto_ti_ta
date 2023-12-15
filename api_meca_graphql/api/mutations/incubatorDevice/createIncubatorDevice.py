import graphene
from graphene_django import DjangoObjectType
from api.models import IncubatorDevice, User, IncubatorSetting
from api.querys.incubatorDeviceQuery import IncubatorDeviceType
# Importe qualquer outro modelo necessário

class CreateIncubatorDevice(graphene.Mutation):
    class Arguments:
        # Defina aqui os argumentos necessários para criar um IncubatorDevice
        user_id = graphene.Int(required=True)
        name=graphene.String(required=True)
        current_setting = graphene.Int(required=False)

    # O tipo de retorno da mutação
    incubator_device = graphene.Field(IncubatorDeviceType)

    @staticmethod
    def mutate(root, info, user_id, name, current_setting=None):
        user = User.objects.get(pk=user_id)
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")

        # Verifica se current_setting foi fornecido
        if current_setting is not None:
            incubator_set = IncubatorSetting.objects.get(id=current_setting)
        else:
            incubator_set = None

        incubator_device = IncubatorDevice(
            user=user,
            name=name,
            current_setting=incubator_set
        )

        incubator_device.save()

        return CreateIncubatorDevice(incubator_device=incubator_device)
