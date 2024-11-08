É necessário que sejam utilizadas as bases de dados CouchDB e MongoDB, portanto em cada
tema onde aparece DB_X e DB_Y, substitua pelas bases escolhidas por cada time. OBS: Os 2
times do grupo devem utilizar bases distintas, ou seja, se o time 1 escolheu MongoDB e time 2
deve utilizar CouchDb e vice-versa;

2. Integração de Logs e Análise de Uso de Aplicação
Como Funciona:

o Time 1 (Monitoramento): Trabalha com os dados referentes aos logs de usuários
em DB_Y.

o Time 2 (Análise): Consumir logs por meio de uma API e calcular métricas, como
tempo médio por página, padrões de navegação, e momentos de pico de uso e
armazenar os resultados em DB_X.
Base de dados: logs_uso.json