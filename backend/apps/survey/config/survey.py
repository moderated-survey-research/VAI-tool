from apps.survey.enums import BFI2SDomainEnum, CFQDomainEnum, BFI2SFacetEnum


BFI2S_EVALUATION_CONFIG = {
    BFI2SDomainEnum.EXTRAVERSION.value: {
        "scoring": {
            1: True,
            6: False,
            11: False,
            16: False,
            21: True,
            26: True,
        },
        "facets": {
            "scoring": {
                BFI2SFacetEnum.SOCIABILITY.value: {
                    1: True,
                    16: False,
                },
                BFI2SFacetEnum.ASSERTIVENESS.value: {
                    6: False,
                    21: True,
                },
                BFI2SFacetEnum.ENERGY_LEVEL.value: {
                    11: False,
                    26: True,
                },
            }
        },
    },
    BFI2SDomainEnum.AGREEABLENESS.value: {
        "scoring": {
            2: False,
            7: True,
            12: False,
            17: True,
            22: False,
            27: True,
        },
        "facets": {
            "scoring": {
                BFI2SFacetEnum.COMPASSION.value: {
                    2: False,
                    17: True,
                },
                BFI2SFacetEnum.RESPECTFULNESS.value: {
                    7: True,
                    22: False,
                },
                BFI2SFacetEnum.TRUST.value: {
                    12: False,
                    27: True,
                },
            }
        },
    },
    BFI2SDomainEnum.CONSCIENTIOUSNESS.value: {
        "scoring": {
            3: True,
            8: True,
            13: False,
            18: False,
            23: False,
            28: True,
        },
        "facets": {
            "scoring": {
                BFI2SFacetEnum.ORGANIZATION.value: {
                    3: True,
                    18: False,
                },
                BFI2SFacetEnum.PRODUCTIVENESS.value: {
                    8: True,
                    23: False,
                },
                BFI2SFacetEnum.RESPONSIBILITY.value: {
                    13: False,
                    28: True,
                },
            }
        },
    },
    BFI2SDomainEnum.NEGATIVE_EMOTIONALITY.value: {
        "scoring": {
            4: False,
            9: False,
            14: True,
            19: True,
            24: True,
            29: False,
        },
        "facets": {
            "scoring": {
                BFI2SFacetEnum.ANXIETY.value: {
                    4: False,
                    19: True,
                },
                BFI2SFacetEnum.DEPRESSION.value: {
                    9: False,
                    24: True,
                },
                BFI2SFacetEnum.EMOTIONAL_VOLATILITY.value: {
                    14: True,
                    29: False,
                },
            }
        },
    },
    BFI2SDomainEnum.OPEN_MINDEDNESS.value: {
        "scoring": {
            5: False,
            10: True,
            15: False,
            20: True,
            25: False,
            30: True,
        },
        "facets": {
            "scoring": {
                BFI2SFacetEnum.AESTHETIC_SENSITIVITY.value: {
                    5: False,
                    20: True,
                },
                BFI2SFacetEnum.INTELLECTUAL_CURIOSITY.value: {
                    10: True,
                    25: False,
                },
                BFI2SFacetEnum.CREATIVE_IMAGINATION.value: {
                    15: False,
                    30: True,
                },
            }
        },
    },
}

CFQ_EVALUATION_CONFIG = {
    CFQDomainEnum.FORGETFULNESS.value: [1, 2, 5, 7, 17, 20, 22, 23],
    CFQDomainEnum.DISTRACTIBILITY.value: [8, 9, 10, 11, 14, 19, 21, 25],
    CFQDomainEnum.FALSE_TRIGGERING.value: [2, 3, 5, 6, 12, 18, 23, 24],
}
