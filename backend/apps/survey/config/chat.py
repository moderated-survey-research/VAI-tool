from apps.survey.enums import AgentID

FOLLOW_UPS = {
    "default": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Hey! Could you share a bit more about this? I'd love to hear your thoughts.",
    },
    "bfi2s_classic_main_tends_quiet": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Being quiet or talkative can shape how we connect with others. Have you noticed how often you talk affects the interactions with people around you?",
    },
    "bfi2s_avatar_main_tends_quiet": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Being quiet or talkative can shape how we connect with others. Have you noticed how often you talk affects the interactions with people around you?",
    },
    "bfi2s_classic_main_fascinated_art_music": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Art, music, and literature can really shape our lives in unique ways. How do they influence your day-to-day experiences or the way you see the world?",
    },
    "bfi2s_avatar_main_fascinated_art_music": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Art, music, and literature can really shape our lives in unique ways. How do they influence your day-to-day experiences or the way you see the world?",
    },
    "bfi2s_classic_main_difficulty_starting_tasks": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Getting started on things can be tough sometimes. Do you find certain types of tasks harder to begin than others? What helps you push through when that happens?",
    },
    "bfi2s_avatar_main_difficulty_starting_tasks": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Getting started on things can be tough sometimes. Do you find certain types of tasks harder to begin than others? What helps you push through when that happens?",
    },
    "bfi2s_classic_main_feels_depressed": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "What factors negatively influence your mood? Is there anything you do to help manage it?",
    },
    "bfi2s_avatar_main_feels_depressed": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "What factors negatively influence your mood? Is there anything you do to help manage it?",
    },
    "bfi2s_classic_main_full_of_energy": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Having a lot of energy can shape your day in different ways. How do you usually channel your energy? Are there moments when it feels like too much or not enough?",
    },
    "bfi2s_avatar_main_full_of_energy": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Having a lot of energy can shape your day in different ways. How do you usually channel your energy? Are there moments when it feels like too much or not enough?",
    },
    "bfi2s_classic_main_emotionally_stable": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Is there anything you'd like to improve at, in regards to emotional stability?",
    },
    "bfi2s_avatar_main_emotionally_stable": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Is there anything you'd like to improve at, in regards to emotional stability?",
    },
    "bfi2s_classic_main_cold_uncaring": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Have you noticed times when you feel more distant or detached? How do you think that impacts your relationships?",
    },
    "bfi2s_avatar_main_cold_uncaring": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Have you noticed times when you feel more distant or detached? How do you think that impacts your relationships?",
    },
    "bfi2s_classic_main_neat_tidy": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Do you usually stick to a set routine to stay organized, or do you prefer taking things one step at a time?",
    },
    "bfi2s_avatar_main_neat_tidy": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Do you usually stick to a set routine to stay organized, or do you prefer taking things one step at a time?",
    },
    "bfi2s_classic_main_respectful_treats_respect": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Respect can mean different things to different people. What does treating others with respect look like to you in daily life?",
    },
    "bfi2s_avatar_main_respectful_treats_respect": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Respect can mean different things to different people. What does treating others with respect look like to you in daily life?",
    },
    "bfi2s_classic_main_little_creativity": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Can you name any situation that has allowed you to express yourself creatively and how?",
    },
    "bfi2s_avatar_main_little_creativity": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Can you name any situation that has allowed you to express yourself creatively and how?",
    },
    "cfq_classic_main_forget_why_moved": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Can you recall any situations when your purpose for being in a room skipped your mind? Do you have any explanation for why it happened?",
    },
    "cfq_avatar_main_forget_why_moved": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Can you recall any situations when your purpose for being in a room skipped your mind? Do you have any explanation for why it happened?",
    },
    "cfq_classic_main_forget_turned_off_light": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Are there any specific switches or locks that you forget about, or does it happen in general. Do you have any little routines or reminders to help you?",
    },
    "cfq_avatar_main_forget_turned_off_light": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Are there any specific switches or locks that you forget about, or does it happen in general. Do you have any little routines or reminders to help you?",
    },
    "cfq_classic_main_fail_listen_names": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Remembering names can be effortless for some and tricky for others. Are there people whose names you find easier or harder to remember?",
    },
    "cfq_avatar_main_fail_listen_names": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Remembering names can be effortless for some and tricky for others. Are there people whose names you find easier or harder to remember?",
    },
    "cfq_classic_main_fail_hear_speaking": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Balancing attention between tasks and conversations can vary from person to person. How do you usually manage focus when you're engaged in something?",
    },
    "cfq_avatar_main_fail_hear_speaking": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Balancing attention between tasks and conversations can vary from person to person. How do you usually manage focus when you're engaged in something?",
    },
    "cfq_classic_main_daydream_while_listening": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "It's common for people to experience moments of distraction. Do you recall situations when it happens to you?",
    },
    "cfq_avatar_main_daydream_while_listening": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "It's common for people to experience moments of distraction. Do you recall situations when it happens to you?",
    },
    "cfq_classic_main_forget_where_put_something": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Some people prefer to keep things in the same spot, while others leave them wherever they last used them. What approach works best for you, and why do you think that is?",
    },
    "cfq_avatar_main_forget_where_put_something": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Some people prefer to keep things in the same spot, while others leave them wherever they last used them. What approach works best for you, and why do you think that is?",
    },
    "cfq_classic_main_cant_remember_tip_of_tongue": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Do you have any techniques to help you remember? How important are the things that you forget like this?",
    },
    "cfq_avatar_main_cant_remember_tip_of_tongue": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Do you have any techniques to help you remember? How important are the things that you forget like this?",
    },
    "cfq_classic_main_forget_shopping_items": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "When it comes to remembering what you need at the store, do you have a go-to trick or routine? Or do you just wing it and hope for the best?",
    },
    "cfq_avatar_main_forget_shopping_items": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "When it comes to remembering what you need at the store, do you have a go-to trick or routine? Or do you just wing it and hope for the best?",
    },
    "cfq_classic_main_cant_think_to_say": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Some conversations flow easily, while others can be more challenging. Do you notice any patterns in what makes a conversation feel easier or harder to engage in?",
    },
    "cfq_avatar_main_cant_think_to_say": {
        "agent_id": AgentID.FOLLOW_UP.value,
        "content": "Some conversations flow easily, while others can be more challenging. Do you notice any patterns in what makes a conversation feel easier or harder to engage in?",
    },
}

DISCUSSIONS = {
    "default": {
        "agent_id": AgentID.DISCUSSION.value,
        "content": "Hey there! I'll be your assistant throughout this survey. Got any questions before we start?",
    },
    "bfi2s_classic_what_to_expect": {
        "agent_id": AgentID.DISCUSSION.value,
        "content": "Hey there! I'll be your assistant throughout this survey. Got any questions before we start?",
    },
    "bfi2s_avatar_what_to_expect": {
        "agent_id": AgentID.DISCUSSION.value,
        "content": "Hey there! I'll be your assistant throughout this survey. Before we begin, just a quick note—think before you speak, then press the button to talk. If you pause for a few seconds, I'll take that as the end of your response. Got any questions before we start?",
    },
    "bfi2s_classic_results": {
        "agent_id": AgentID.DISCUSSION.value,
        "content": "Nice job finishing up the survey! Let's go over your results together. I'll highlight the key points and help clarify anything you're curious about. If there's anything specific you'd like to dig into, just let me know.",
    },
    "bfi2s_avatar_results": {
        "agent_id": AgentID.DISCUSSION.value,
        "content": "Nice job finishing up the survey! Let's go over your results together. I'll highlight the key points and help clarify anything you're curious about. If there's anything specific you'd like to dig into, just let me know.",
    },
    "cfq_classic_what_to_expect": {
        "agent_id": AgentID.DISCUSSION.value,
        "content": "Hey there! I'll be your assistant throughout this survey. Got any questions before we start?",
    },
    "cfq_avatar_what_to_expect": {
        "agent_id": AgentID.DISCUSSION.value,
        "content": "Hey there! I'll be your assistant throughout this survey. Before we begin, just a quick note—think before you speak, then press the button to talk. If you pause for a few seconds, I'll take that as the end of your response. Got any questions before we start?",
    },
    "cfq_classic_results": {
        "agent_id": AgentID.DISCUSSION.value,
        "content": "Nice job finishing up the survey! Let's go over your results together. I'll highlight the key points and help clarify anything you're curious about. If there's anything specific you'd like to dig into, just let me know.",
    },
    "cfq_avatar_results": {
        "agent_id": AgentID.DISCUSSION.value,
        "content": "Nice job finishing up the survey! Let's go over your results together. I'll highlight the key points and help clarify anything you're curious about. If there's anything specific you'd like to dig into, just let me know.",
    },
}
