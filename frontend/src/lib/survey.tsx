import { BFI2SDomainEnum, CFQDomainEnum, SurveyQuestionnaireType } from "@/types/survey";

export const DOMAIN_DESCRIPTIONS = {
  [SurveyQuestionnaireType.BFI2S]: {
    [BFI2SDomainEnum.EXTRAVERSION]: (
      <p>
        High scorers tend to be talkative and energetic. They like being around people, and are comfortable asserting
        themselves in a group. High scorers tend to have more friends and dating partners, and are seen as more popular.
        They generally prefer, and are successful in, social and enterprising occupations. They are more likely to serve
        in community leadership roles, and to do volunteer work. They tend to prefer energetic music such as hip-hop,
        rock, and heavy metal, exercise more frequently, and are more likely to play a sport. They experience more
        frequent positive emotions, and react more strongly to positive events. Women tend to score higher than men.
        <br />
        <br />
        Low scorers tend to be socially and emotionally reserved. They generally prefer to be alone or with a few close
        friends, and keep their opinions and feelings to themselves. Low scorers tend to pursue, and do better in, jobs
        that involve independent work rather than social interaction. They are less likely to engage in thrill-seeking
        or risky behaviors, such as smoking, alcohol consumption, and risky sexual activity.
      </p>
    ),
    [BFI2SDomainEnum.AGREEABLENESS]: (
      <p>
        High scorers tend to be considerate and polite in social interactions, and enjoy cooperating. They find it easy
        to trust people, and feel compassion for those in need. High scorers tend to be well liked by their peers, and
        establish satisfying and stable close relationships. They generally prefer, and do better in, social
        occupations. They are more likely to be religious, to serve in community leadership roles, and to do volunteer
        work. They tend to prefer pop, country, and religious music. Women tend to score higher than men, and older
        adults tend to score higher than younger adults.
        <br />
        <br />
        Low scorers express themselves directly and bluntly, even at the risk of starting an argument. They enjoy
        competition, and tend to be skeptical of other people's intentions. Low scorers tend to earn higher salaries,
        and are more likely to engage in some risky behaviors, such as smoking and aggressive driving.
      </p>
    ),
    [BFI2SDomainEnum.CONSCIENTIOUSNESS]: (
      <p>
        Conscientiousness High scorers tend to be organized and responsible. They work hard to achieve their goals, and
        see tasks through to completion. High scorers tend to earn higher grades in school, and perform better in many
        occupations. They are more likely to be religious and hold conservative political attitudes. They tend to
        exercise more, have better physical health, and live longer. Women tend to score higher than men, and older
        adults tend to score higher than younger adults.
        <br />
        <br />
        Low scorers tend to act spontaneously rather than making plans, and find it easier to look at the big picture
        than pay attention to details. They prefer to jump between tasks, instead of finishing one at a time. Low
        scorers are more likely to hold liberal political attitudes. They tend to engage in more risky behaviors, such
        as smoking, alcohol consumption, drug use, and risky sexual activity.
      </p>
    ),
    [BFI2SDomainEnum.NEGATIVE_EMOTIONALITY]: (
      <p>
        High scorers tend to be emotionally sensitive, and have up-and-down mood swings. They experience more frequent
        negative emotions, and react more strongly to negative events. Women tend to score higher than men, and younger
        adults tend to score higher than older adults.
        <br />
        <br />
        Low scorers tend to be emotionally stable and resilient. They usually stay calm, even in stressful situations,
        and can quickly bounce back from negative events. Low scorers tend to feel a greater sense of well-being.
      </p>
    ),
    [BFI2SDomainEnum.OPEN_MINDEDNESS]: (
      <p>
        High scorers are generally open to new activities and new ideas. They tend to be creative, intellectually
        curious, and sensitive to art and beauty. High scorers tend to prefer, and do better in, scientific and artistic
        occupations. They are more likely to hold liberal political attitudes, prefer classical, jazz, blues, and rock
        music, and engage in drug use.
        <br />
        <br />
        Low scorers tend to be traditional, down-to-earth, and stick with tried-and-true ways of doing things. They
        prefer the familiar over the new, and the concrete over the abstract. Low scorers tend to prefer, and do better
        in, conventional and practical occupations. They are more likely to hold conservative political attitudes.
      </p>
    ),
  },
  [SurveyQuestionnaireType.CFQ]: {
    [CFQDomainEnum.FORGETFULNESS]: (
      <p>
        High scorers frequently experience lapses in memory, such as forgetting names, intentions, appointments, and
        words. They may often find themselves unable to recall information that was previously known or planned. This
        can lead to challenges in daily activities that require reliable memory function.
        <br />
        <br />
        Low scorers rarely encounter such memory lapses, maintaining a consistent ability to remember important
        information and plans. They are typically dependable in recalling names, appointments, and other details, which
        supports effective daily functioning.
      </p>
    ),
    [CFQDomainEnum.DISTRACTIBILITY]: (
      <p>
        High scorers tend to have difficulties maintaining attention, especially in social situations or interactions
        with others. They may be easily distracted or absent-minded, leading to challenges in focusing on tasks or
        conversations. This can result in misunderstandings or overlooked details in social and work settings.
        <br />
        <br />
        Low scorers are generally able to maintain focused attention, even amidst potential distractions. They can
        engage fully in tasks and interactions without their attention wavering, contributing to effective communication
        and task completion.
      </p>
    ),
    [CFQDomainEnum.FALSE_TRIGGERING]: (
      <p>
        High scorers often experience unintended actions or interruptions in cognitive and motor sequences. This may
        manifest as starting an action unintentionally or having difficulty completing a sequence of tasks smoothly.
        Such interruptions can lead to errors in daily routines or activities that require coordinated actions.
        <br />
        <br />
        Low scorers typically execute cognitive and motor tasks without unintended interruptions, maintaining smooth and
        intentional sequences of actions. This proficiency supports efficiency and accuracy in daily activities.
      </p>
    ),
  },
};
