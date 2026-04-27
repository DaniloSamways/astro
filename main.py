from utils import verify_visibility

from astroquery.simbad import Simbad
from astropy.coordinates import SkyCoord, EarthLocation, AltAz
from astropy.time import Time
import astropy.units as u

custom_simbad = Simbad()
custom_simbad.add_votable_fields('V')

# Dados estrela Sirius
sirius_data = custom_simbad.query_object("Sirius")['matched_id', 'ra', 'dec', 'V']

name = sirius_data['matched_id'][0]
clean_name = name.replace("NAME ", "")
flux_v = sirius_data['V'][0]  # Magnitude visual
ra = sirius_data['ra'][0]   # Ascensão reta
dec = sirius_data['dec'][0] # Declinação

# Coordenadas
star = SkyCoord(ra, dec, unit=(u.hourangle, u.deg))

# Localização do observatório
location = EarthLocation(
  lat = -25.1 * u.deg,
  lon = -50.2 * u.deg,
  height = 900 * u.m
)

# Horário local
time = Time.now()

# Converter para coordenadas locais
altaz = star.transform_to(AltAz(obstime=time, location=location))

altitude = altaz.alt.degree
azimute = altaz.az.degree

# Verificar visibilidade
visibility_message = verify_visibility(altitude, flux_v)

print(f"Estrela: {clean_name}")
print(f"Magnitude visual: {flux_v}")
print(f"Altitude: {altitude:.6f}°")
print(f"Azimute: {azimute:.6f}°")
print(visibility_message)