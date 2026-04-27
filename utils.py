def verify_visibility(altitude, magnitude):
  if altitude < 0:
    return "❌ A estrela está abaixo do horizonte e não é visível."

  if magnitude > 6:
    return "🔭 A estrela é muito fraca para ser vista a olho nu."

  return "🌟 A estrela é visível no céu."