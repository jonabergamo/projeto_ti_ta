from datetime import timedelta
import graphene
from api.types import IncubatorSettingType
from api.models import IncubatorSetting

class UpdateIncubatorSetting(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        name = graphene.String()
        temperature = graphene.Float()
        humidity = graphene.Float()
        incubation_duration = graphene.Float()  # Número de dias como inteiro

    # O tipo de retorno da mutação
    incubator_setting = graphene.Field(IncubatorSettingType)

    @staticmethod
    def mutate(root, info, id, name=None, temperature=None, humidity=None, incubation_duration=None):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        try:
            incubator_setting = IncubatorSetting.objects.get(pk=id)
        except IncubatorSetting.DoesNotExist:
            return None

        if name is not None:
            incubator_setting.name = name
        if temperature is not None:
            incubator_setting.temperature = temperature
        if humidity is not None:
            incubator_setting.humidity = humidity
        if incubation_duration is not None:
            incubator_setting.incubation_duration = incubation_duration

        incubator_setting.save()
        return UpdateIncubatorSetting(incubator_setting=incubator_setting)
