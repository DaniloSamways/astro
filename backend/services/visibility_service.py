from __future__ import annotations


def verify_visibility(
    altitude: float,
    magnitude: float | None,
    cloud_cover: float | None,
) -> list[str]:
    messages = []

    if altitude < 0:
        return [
            "❌ Não está visível: o objeto está abaixo do horizonte.",
            (
                f"📍 Altitude atual: {altitude:.2f}°. "
                "Ele precisaria estar acima de 0° para aparecer no céu."
            ),
        ]

    difficult_conditions = []
    favorable_conditions = []

    if altitude < 10:
        difficult_conditions.append(
            "📍 O objeto está muito baixo no horizonte, o que prejudica bastante a observação."
        )
    else:
        favorable_conditions.append("📍 O objeto está acima do horizonte.")

    if magnitude is None:
        difficult_conditions.append(
            "🔎 A magnitude visual não foi encontrada, então o brilho do objeto é incerto."
        )
    elif magnitude > 6:
        difficult_conditions.append(
            "🔭 O objeto tende a ser fraco para observação a olho nu."
        )
    else:
        favorable_conditions.append("✨ O brilho pode permitir observação a olho nu.")

    if cloud_cover is None:
        difficult_conditions.append("☁️ Não foi possível avaliar a cobertura de nuvens.")
    elif cloud_cover >= 85:
        difficult_conditions.append(
            "☁️ O céu está muito nublado; isso praticamente impede a observação."
        )
    elif cloud_cover >= 60:
        difficult_conditions.append(
            "⛅ O céu está bem nublado e pode atrapalhar bastante."
        )
    elif cloud_cover >= 25:
        difficult_conditions.append(
            "⛅ Há nuvens no céu, mas ainda pode ser possível observar."
        )
    else:
        favorable_conditions.append("🌌 O céu deve colaborar bem para a observação.")

    if cloud_cover is not None and cloud_cover >= 85:
        messages.append(
            "❌ Não está visível em boas condições: a cobertura de nuvens está alta demais."
        )
    elif altitude < 10 or magnitude is None or (
        magnitude is not None and magnitude > 6
    ) or (cloud_cover is not None and cloud_cover >= 60):
        messages.append(
            "⚠️ Visibilidade difícil: talvez dê para observar, mas as condições não são boas."
        )
    else:
        messages.append("✅ Está visível: as condições estão favoráveis para observação.")

    messages.extend(difficult_conditions)
    messages.extend(favorable_conditions)
    return messages


def build_visibility_summary(object_data: dict, sky_position: dict) -> str:
    altitude = sky_position["altitude"]
    magnitude = object_data["magnitude"]

    if altitude < 0:
        status = "❌ Não visível"
    elif altitude < 10:
        status = "⚠️ Muito baixo"
    elif magnitude is not None and magnitude > 6:
        status = "⚠️ Fraco"
    else:
        status = "✅ Visível"

    magnitude_text = "N/D" if magnitude is None else f"{magnitude:.2f}"
    return (
        f"{status} | {object_data['name']} | "
        f"Altitude: {sky_position['altitude']:.2f}° | "
        f"Azimute: {sky_position['azimuth']:.2f}° | "
        f"Magnitude: {magnitude_text}"
    )
