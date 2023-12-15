import graphene
from graphene_django import DjangoObjectType
from api.models import IncubatorDevice, IncubatorSetting, User
from api.types import IncubatorDeviceType
from datetime import datetime, timezone

class UpdateIncubatorDevice(graphene.Mutation):
    class Arguments:
        unique_id = graphene.String(required=True)
        user_id = graphene.Int()
        current_setting_id = graphene.Int()
        is_on = graphene.Boolean()
        humidity_sensor = graphene.String()
        name = graphene.String()
        temperature_sensor = graphene.String()

    # O tipo de retorno da mutação
    incubator_device = graphene.Field(IncubatorDeviceType)

    @staticmethod
    def mutate(root, info, unique_id, user_id=None, current_setting_id=None, is_on=None, humidity_sensor=None, temperature_sensor=None, name=None):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        try:
            device = IncubatorDevice.objects.get(unique_id=unique_id)
        except IncubatorDevice.DoesNotExist:
            return None

        if user_id is not None:
            device.user = User.objects.get(pk=user_id)
        if current_setting_id is not None:
            device.current_setting = IncubatorSetting.objects.get(pk=current_setting_id)
        if is_on is not None:
            if is_on == False and device.start_time and device.current_setting:
                device.last_completion_data = datetime.now(timezone.utc)
            device.is_on = is_on
        if humidity_sensor is not None:
            device.humidity_sensor = humidity_sensor
        if temperature_sensor is not None:
            device.temperature_sensor = temperature_sensor
        if name is not None:
            device.name = name  
            
        if device.is_on and device.start_time and device.current_setting:
            elapsed_time = datetime.now(timezone.utc) - device.start_time
            incubation_duration = device.current_setting.incubation_duration
            incubation_completed = elapsed_time.total_seconds() >= incubation_duration * 3600

            if incubation_completed:
                device.is_on = False  # Desligar o dispositivo
                device.last_completion_data = datetime.now(timezone.utc)

        device.save()

        return UpdateIncubatorDevice(incubator_device=device)
