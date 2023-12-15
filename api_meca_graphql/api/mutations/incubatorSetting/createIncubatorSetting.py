import graphene
from graphene_django import DjangoObjectType
from api.models import User, IncubatorSetting
from api.querys.incubatorDeviceQuery import IncubatorDeviceType
from api.types import IncubatorSettingType
from datetime import timedelta

# Importe qualquer outro modelo necessário

class CreateIncubatorSetting(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        temperature = graphene.Float(required=True)
        humidity = graphene.Float(required=True)
        incubation_duration = graphene.Float(required=True)  # Supondo que seja um valor inteiro de dias
        user_id = graphene.Int(required=True)

    # O tipo de retorno da mutação
    incubator_setting = graphene.Field(IncubatorSettingType)

    @staticmethod
    def mutate(root, info, name, temperature, humidity, incubation_duration, user_id):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        user = User.objects.get(pk=user_id)
        incubator_setting = IncubatorSetting(
            name=name,
            temperature=temperature,
            humidity=humidity,
            incubation_duration=incubation_duration,  # Convertendo para timedelta
            user=user
        )
        incubator_setting.save()

        return CreateIncubatorSetting(incubator_setting=incubator_setting)
