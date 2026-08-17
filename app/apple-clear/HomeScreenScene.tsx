import { memo } from "react";

export interface HomeScreenIcon {
  color: string;
}

/** Color tiles only. Unicode glyphs leak as a second label set under the menu. */
export const HOME_SCREEN_ICONS: readonly HomeScreenIcon[] = [
  { color: "#1c1c1e" },
  { color: "#2f7d32" },
  { color: "#0a84ff" },
  { color: "#ff3b30" },
  { color: "#ffcc00" },
  { color: "#5e5ce6" },
  { color: "#64d2ff" },
  { color: "#30d158" },
  { color: "#ff375f" },
  { color: "#bf5af2" },
  { color: "#ff9f0a" },
  { color: "#ac8e68" },
  { color: "#ff2d55" },
  { color: "#32ade6" },
  { color: "#00c7be" },
  { color: "#ffd60a" },
  { color: "#8e8e93" },
  { color: "#007aff" },
  { color: "#34c759" },
  { color: "#af52de" },
];

export const HomeScreenScene = memo(function HomeScreenScene({
  copy,
}: {
  copy: "visible" | "replica";
}) {
  return (
    <div
      className="apple-clear-homescreen"
      data-liquid-glass-scene-copy={copy}
      data-liquid-glass-scene-layer="wallpaper"
      aria-hidden="true"
    >
      <span className="apple-clear-homescreen__sky" />
      <span className="apple-clear-homescreen__ribbon" />
      <span className="apple-clear-homescreen__clock" data-liquid-glass-scene-layer="type">
        09:54
      </span>
      <div className="apple-clear-homescreen__grid" data-liquid-glass-scene-layer="color-bands">
        {HOME_SCREEN_ICONS.map((icon, index) => (
          <span
            key={`${icon.color}-${index}`}
            className="apple-clear-homescreen__icon"
            style={{ background: icon.color }}
          />
        ))}
      </div>
      <span className="apple-clear-homescreen__dock" />
    </div>
  );
});
