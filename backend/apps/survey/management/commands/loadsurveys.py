import os
from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    directory = "apps/survey/fixtures"
    help = "Load surveys into database"
    fixtures = [
        directory + "/001_surveys/001_surveys.json",
        directory + "/002_sections/001_bfi2s/001_classic.json",
        directory + "/002_sections/001_bfi2s/002_avatar.json",
        directory + "/002_sections/002_cfq/001_classic.json",
        directory + "/002_sections/002_cfq/002_avatar.json",
        directory + "/003_scales/001_scales.json",
        directory + "/004_questions/001_bfi2s/001_classic/001_main.json",
        directory + "/004_questions/001_bfi2s/001_classic/002_intro.json",
        directory + "/004_questions/001_bfi2s/001_classic/003_outro.json",
        directory + "/004_questions/001_bfi2s/002_avatar/001_main.json",
        directory + "/004_questions/001_bfi2s/002_avatar/002_intro.json",
        directory + "/004_questions/001_bfi2s/002_avatar/003_outro.json",
        directory + "/004_questions/002_cfq/001_classic/001_main.json",
        directory + "/004_questions/002_cfq/001_classic/002_intro.json",
        directory + "/004_questions/002_cfq/001_classic/003_outro.json",
        directory + "/004_questions/002_cfq/002_avatar/001_main.json",
        directory + "/004_questions/002_cfq/002_avatar/002_intro.json",
        directory + "/004_questions/002_cfq/002_avatar/003_outro.json",
        directory + "/005_options/001_bfi2s/001_classic/001_intro/002_age.json",
        directory + "/005_options/001_bfi2s/001_classic/001_intro/003_gender.json",
        directory + "/005_options/001_bfi2s/001_classic/001_intro/004_race.json",
        directory + "/005_options/001_bfi2s/001_classic/001_intro/005_education.json",
        directory
        + "/005_options/001_bfi2s/001_classic/001_intro/006_interaction_ai.json",
        directory + "/005_options/001_bfi2s/001_classic/001_intro/007_income.json",
        directory
        + "/005_options/001_bfi2s/001_classic/001_intro/008_attention_check.json",
        directory
        + "/005_options/001_bfi2s/001_classic/003_main/001_attention_check.json",
        directory + "/005_options/001_bfi2s/002_avatar/001_intro/002_age.json",
        directory + "/005_options/001_bfi2s/002_avatar/001_intro/003_gender.json",
        directory + "/005_options/001_bfi2s/002_avatar/001_intro/004_race.json",
        directory + "/005_options/001_bfi2s/002_avatar/001_intro/005_education.json",
        directory
        + "/005_options/001_bfi2s/002_avatar/001_intro/006_interaction_ai.json",
        directory + "/005_options/001_bfi2s/002_avatar/001_intro/007_income.json",
        directory
        + "/005_options/001_bfi2s/002_avatar/001_intro/008_attention_check.json",
        directory
        + "/005_options/001_bfi2s/002_avatar/003_main/001_attention_check.json",
        directory + "/005_options/002_cfq/001_classic/001_intro/002_age.json",
        directory + "/005_options/002_cfq/001_classic/001_intro/003_gender.json",
        directory + "/005_options/002_cfq/001_classic/001_intro/004_race.json",
        directory + "/005_options/002_cfq/001_classic/001_intro/005_education.json",
        directory
        + "/005_options/002_cfq/001_classic/001_intro/006_interaction_ai.json",
        directory + "/005_options/002_cfq/001_classic/001_intro/007_income.json",
        directory
        + "/005_options/002_cfq/001_classic/001_intro/008_attention_check.json",
        directory
        + "/005_options/002_cfq/001_classic/003_main/001_attention_check.json",
        directory + "/005_options/002_cfq/002_avatar/001_intro/002_age.json",
        directory + "/005_options/002_cfq/002_avatar/001_intro/003_gender.json",
        directory + "/005_options/002_cfq/002_avatar/001_intro/004_race.json",
        directory + "/005_options/002_cfq/002_avatar/001_intro/005_education.json",
        directory + "/005_options/002_cfq/002_avatar/001_intro/006_interaction_ai.json",
        directory + "/005_options/002_cfq/002_avatar/001_intro/007_income.json",
        directory
        + "/005_options/002_cfq/002_avatar/001_intro/008_attention_check.json",
        directory + "/005_options/002_cfq/002_avatar/003_main/001_attention_check.json",
    ]

    def handle(self, *args, **kwargs) -> None:
        for filepath in self.fixtures:
            if os.path.exists(filepath):
                self.stdout.write(f"Loading {filepath}")
                call_command("loaddata", filepath)
            else:
                self.stdout.write(self.style.WARNING(f"File {filepath} not found"))

        self.stdout.write(self.style.SUCCESS("All surveys loaded successfully"))
