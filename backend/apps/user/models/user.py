from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from apps.common.models import TimeStamped
from django_stubs_ext.db.models import TypedModelMeta


class UserManager(BaseUserManager["User"]):
    def create_user(self, username: str, password: str) -> "User":
        user = self.model(username=username)
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin, TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "users"

    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["password"]

    objects: UserManager = UserManager()
