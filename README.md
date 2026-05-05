### 1. Instalar Python

sudo apt install python3-venv python3-full -y

### 2. Cria o ambiente virtual

python3 -m venv venv

### 3. Ativa o ambiente

source venv/bin/activate

### 4. Instalar dependências

pip install astropy astroquery matplotlib numpy requests skyfield



## Documentação Astroquery
https://astroquery.readthedocs.io/en/latest/api/astroquery.simbad.SimbadClass.html


## Como usar

Execute:

```bash
python3 main.py
```

O programa agora pergunta no terminal:

- qual estrela ou objeto deseja consultar
- latitude do local de observacao
- longitude do local de observacao
- altitude do local em metros
- data e hora da observacao

Depois disso, ele:

- consulta o objeto no banco SIMBAD
- calcula altitude e azimute para o horario informado
- tenta consultar cobertura de nuvens com a API Open-Meteo
- faz uma analise inicial de visibilidade com base em horizonte, brilho e nuvens
- pode listar satélites visualmente observáveis nas próximas horas


## Satélites visíveis

Para satélites, o programa usa elementos orbitais atuais e calcula as próximas passagens visualmente favoráveis para a cidade escolhida.

Fontes e base técnica:

- CelesTrak para dados orbitais GP/TLE atualizados
- Skyfield para previsão das passagens e checagem de iluminação do satélite
