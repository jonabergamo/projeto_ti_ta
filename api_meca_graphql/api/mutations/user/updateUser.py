import graphene
from api.models import User
from api.types import UserType

class UpdateUser(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        username = graphene.String()
        email = graphene.String()
        password = graphene.String()
        first_name = graphene.String()
        last_name = graphene.String()
        is_staff = graphene.Boolean()
        is_active = graphene.Boolean()
        base64_image = graphene.String()
        is_trusty = graphene.Boolean()

    user = graphene.Field(UserType)

    @staticmethod
    def mutate(root, info, id, username=None, email=None, password=None,
               first_name=None, last_name=None, is_staff=None, 
               is_active=None, base64_image=None, is_trusty=None):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        
        try:
            user = User.objects.get(pk=id)

            if username is not None:
                user.username = username
            if email is not None:
                user.email = email
            if password is not None:
                user.set_password(password)
            if first_name is not None:
                user.first_name = first_name
            if last_name is not None:
                user.last_name = last_name
            if is_staff is not None:
                user.is_staff = is_staff
            if is_active is not None:
                user.is_active = is_active
            if base64_image is not None:
                user.base64_image = base64_image
            if is_trusty is not None:
                user.is_trusty = is_trusty

            user.save()
            return UpdateUser(user=user)

        except User.DoesNotExist:
            return None
