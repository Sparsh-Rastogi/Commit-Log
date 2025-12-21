from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("Username is required")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(blank=True, null=True)
    level = models.IntegerField(default=1)
    xp = models.IntegerField(default=0)
    user_timezone = models.CharField(max_length=50, default="UTC")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.username

    def add_xp(self, earned_xp: int):
        """Add XP and handle level-ups."""
        self.xp += earned_xp
        while self.xp >= self.next_level_xp():
            self.xp -= self.next_level_xp()
            self.level += 1
        self.save()

    def next_level_xp(self):
        """Simple linear XP growth"""
        return 100 + (self.level - 1) * 50
