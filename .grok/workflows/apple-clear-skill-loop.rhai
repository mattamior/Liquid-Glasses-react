let meta = #{
    name: "apple-clear-skill-loop",
    description: "Iterate Apple Liquid Glass skill through test-N installs until refraction plus traveling lens pass or 10 rounds",
    when_to_use: "Unattended completion of the Apple Liquid Glass skill via test-N projects",
    phases: [
        #{ title: "Round", detail: "score, patch kernel, install next test-N" },
    ],
};

let score_schema = #{
    "type": "object",
    "required": ["round", "passed", "gaps", "stop"],
    "properties": #{
        "round": #{ "type": "number" },
        "passed": #{ "type": "boolean" },
        "gaps": #{ "type": "array", "items": #{ "type": "string" } },
        "stop": #{ "type": "boolean" },
    },
};

let start = if args == () { () } else { args.round };
if start == () { pause("verification", "Pass args.round as the first test number to score (3 after test-1/test-2)."); }

let last_gaps = [];
let last_round = start;
let last_passed = false;
for n in start..11 {
    phase("Round");
    let score_prompt = "";
    score_prompt += "You are scoring Liquid Glass, not frosted glass. ";
    score_prompt += "Read with tools: /Users/jay/Code/Liquid-Glasses-react/app/apple-clear/LiquidGlassAppleClearKernel.tsx, ";
    score_prompt += "apple-clear.css, lens-optics.ts, and SKILL.md. ";
    score_prompt += "Also list /Users/jay/Code/Liquid-Glasses-skill-test/. ";
    score_prompt += "FAIL if the default is only backdrop-filter frost, if there is no traveling selection lens on menu change, ";
    score_prompt += "or if Enhanced does not run feDisplacementMap on a world replica. ";
    score_prompt += "PASS only if: whole-surface replica refraction is real; click/drag uses click-dragging-settling-fading; ";
    score_prompt += "blur is <=10px and secondary; foreground labels stay unfiltered; a blank Vite project can copy the kernel. ";
    score_prompt += "Current round is " + n.to_string() + " of 10. ";
    score_prompt += "Set stop=true only if passed=true or round is 10. List concrete remaining gaps.";
    let score = agent(score_prompt, #{
        label: "score-" + n.to_string(),
        capability_mode: "read-only",
        output_schema: score_schema,
    });
    if score == () || !score.success || score.output == () {
        complete(#{ summary: "Score failed", round: n });
    }
    last_round = n;
    last_passed = score.output.passed;
    last_gaps = score.output.gaps;
    if score.output.stop == true {
        complete(#{
            summary: "Loop stopped",
            round: n,
            passed: score.output.passed,
            gaps: score.output.gaps,
        });
    }

    let patch_prompt = "";
    patch_prompt += "Work in /Users/jay/Code/Liquid-Glasses-react on branch grok/apple-liquid-glass-skill. ";
    patch_prompt += "Close these Liquid Glass gaps (not frost): " + json_encode(score.output.gaps) + " ";
    patch_prompt += "Edit app/apple-clear/* only. Keep the traveling lens and world-replica displacement. ";
    patch_prompt += "Do not replace refraction with stronger blur. ";
    patch_prompt += "Copy the four kernel files to skills/liquid-glass-interface/assets/strict-kernels/apple/ ";
    patch_prompt += "and run node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js. ";
    patch_prompt += "Update docs/decisions/apple-clear-default-kernel.en.md and .zh.md with this round's evidence.";
    let patch = agent(patch_prompt, #{ label: "patch-" + n.to_string(), capability_mode: "all" });
    if patch == () || !patch.success {
        complete(#{ summary: "Patch failed", round: n, gaps: score.output.gaps });
    }

    let next_round = n + 1;
    let install_prompt = "";
    install_prompt += "Create /Users/jay/Code/Liquid-Glasses-skill-test/test-" + next_round.to_string() + " ";
    install_prompt += "as a blank Vite React TS app if missing. ";
    install_prompt += "Copy skills/liquid-glass-interface/assets/strict-kernels/apple/* into src/liquid-glass/kernel/ ";
    install_prompt += "and the Vite apple-strict-adapter. Do not edit the kernel. ";
    install_prompt += "Mount AppleClearStrictAdapter in App.tsx. npm install. ";
    install_prompt += "Write evidence/round-notes.md describing that this is a kernel-only install.";
    let install = agent(install_prompt, #{ label: "install-" + next_round.to_string(), capability_mode: "all" });
    if install == () || !install.success {
        complete(#{ summary: "Install failed", round: next_round });
    }
    last_round = next_round;
}

complete(#{
    summary: "Finished Apple Liquid Glass test loop",
    round: last_round,
    passed: last_passed,
    gaps: last_gaps,
});
