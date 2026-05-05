# Astro

Astro é uma CLI em Python para consultar o céu a partir de uma cidade ou da localização automática do dispositivo. O projeto calcula posição aparente de objetos celestes, estima visibilidade com base em altitude, magnitude e nuvens, e também lista passagens de satélites com potencial de observação.

## O que você pode fazer

- Buscar um objeto específico, como estrela, planeta, Lua ou Sol.
- Listar objetos de referência visíveis no momento.
- Ver passagens de satélites nas próximas horas.
- Usar modo interativo no terminal ou saída JSON para automação.
- Informar cidade manualmente ou deixar o programa tentar detectar sua localização.
- Consumir a mesma lógica astronômica por uma API em Node.js com Express.

## Tecnologias e fontes de dados

- Python 3.10+
- [Astropy](https://www.astropy.org/)
- [Astroquery](https://astroquery.readthedocs.io/)
- [Requests](https://requests.readthedocs.io/)
- [Skyfield](https://rhodesmill.org/skyfield/)
- SIMBAD para consulta de objetos de céu profundo
- Open-Meteo para geocoding e cobertura de nuvens
- IP-API para localização automática por IP
- CelesTrak para elementos orbitais de satélites

## Instalação

No Linux, o caminho mais simples é criar um ambiente virtual e instalar as dependências manualmente:

```bash
sudo apt install python3-venv python3-full -y
python3 -m venv venv
source venv/bin/activate
pip install astropy astroquery requests skyfield
```

Se você preferir, também pode instalar diretamente no seu ambiente Python atual, mas o uso de `venv` é recomendado.

## Como executar

### Modo interativo

Abra o terminal no diretório do projeto e rode:

```bash
python3 main.py
```

Nesse modo, o programa pergunta:

- qual local usar
- se quer detectar a localização automaticamente
- qual objeto deseja consultar
- se a observação será agora ou em outro horário

### Modo JSON

O projeto também expõe uma interface não interativa, ideal para scripts e integrações:

```bash
python3 main.py --json object --city "Curitiba" --object "Sirius"
python3 main.py --json visible-objects --city "São Paulo"
python3 main.py --json satellites --city "Rio de Janeiro"
python3 main.py --json satellites --city "Curitiba" --datetime "2026-05-04T21:30:00-03:00"
python3 main.py --json satellites --auto-location
```

Comandos disponíveis no modo JSON:

- `object`: consulta um objeto específico e retorna posição, dados astronômicos, clima e mensagens de visibilidade.
- `visible-objects`: lista os objetos de referência acima do horizonte no horário informado.
- `satellites`: retorna as passagens previstas e separa as que têm melhor chance de visibilidade.

## API Node.js

O projeto agora também inclui uma camada Express em `node-api/`, pensada para expor as mesmas consultas do Python via HTTP. A API não reimplementa a lógica astronômica: ela chama um bridge Python que reutiliza os services existentes.

### Estrutura da API

- `node-api/package.json`: dependências e scripts do servidor.
- `node-api/src/server.js`: inicialização da API.
- `node-api/src/app.js`: configuração do Express.
- `node-api/src/routes/astro.routes.js`: rotas públicas.
- `node-api/src/services/pythonAstroService.js`: integração com o bridge Python.
- `python_api.py`: entrada Python usada pela API para acessar os services.

### Rotas disponíveis

- `GET /api/v1/health`
- `GET /api/v1/object?name=Sirius&city=São Paulo`
- `GET /api/v1/visible-objects?city=São Paulo`
- `GET /api/v1/satellites?city=São Paulo&datetime=2026-05-04T21:30:00-03:00`

### Como rodar a API

```bash
cd node-api
npm install
npm start
```

Se o Python binário não estiver em `python3`, defina `PYTHON_BIN` antes de iniciar a API.
Por padrão, a API tenta usar o Python do `venv/` do projeto e só depois cai para o binário do sistema.

Exemplo:

```bash
PYTHON_BIN=python3.11 npm start
```

## Exemplos de uso

Buscar um planeta ou estrela:

```bash
python3 main.py --json object --city "São Paulo" --object "Júpiter"
```

Listar objetos visíveis no momento:

```bash
python3 main.py --json visible-objects --city "Belo Horizonte"
```

Ver satélites visíveis nas próximas horas:

```bash
python3 main.py --json satellites --auto-location
```

## Estrutura do projeto

- `main.py`: ponto de entrada principal da aplicação.
- `cli/`: interface de terminal e parser do modo JSON.
- `services/`: regras de negócio, consultas astronômicas e integrações externas.
- `services/api_service.py`: funções prontas para consumo por APIs e automações.
- `python_api.py`: bridge Python consumida pela API Node.
- `node-api/`: API Express que expõe os serviços via HTTP.
- `config.py`: constantes do projeto, objetos suportados e localização padrão.

## Como funciona por baixo dos panos

- Consulta objetos de céu profundo no SIMBAD.
- Resolve planetas, Lua e Sol com efemérides locais.
- Calcula altitude e azimute para a localização informada.
- Busca cobertura de nuvens para o horário desejado.
- Aplica uma análise simples de visibilidade com base em horizonte, magnitude e clima.
- Usa dados orbitais atualizados para estimar passagens de satélites.

## Saída JSON

O modo `--json` foi pensado para integração com outras aplicações. Ele retorna estruturas serializáveis com campos como cidade, horário da observação, objeto consultado, posição no céu, dados do clima e mensagens de visibilidade.

## Observações

- A localização automática depende de serviços externos e pode falhar em redes restritas.
- As previsões de nuvens e de satélites também dependem da disponibilidade das APIs consultadas.
- Os resultados são ótimos para planejamento e triagem rápida, mas não substituem software astronômico especializado.

## Licença

Defina aqui a licença do projeto se você quiser publicar no GitHub com esse detalhe explícito.
