Aplicação para uso pessoal, com intuito de testar e conhecer o framework Next e testar IA na geração de código.

## Docker

Agora a aplicacao sobe junto com o banco de dados pelo proprio `docker-compose.yml` do sistema.

```bash
docker compose up -d --build
```

## Render

O repositório agora inclui um `render.yaml` na raiz para subir:

- um Web Service para a aplicacao Next.js
- um Private Service com MySQL 8.4
- um disco persistente no MySQL para manter os dados entre deploys e reinicios

### Observacoes importantes

- No Render, o banco precisa ficar em um servico separado com disco persistente.
- O Render recomenda usar backup logico com `mysqldump` para bancos MySQL; nao depender apenas de snapshot do disco.
- Servicos com disco persistente nao fazem deploy com zero downtime.

### Publicacao

1. Conecte o repositório ao Render como Blueprint usando o arquivo `render.yaml`.
2. Preencha os segredos pedidos no primeiro sync:
   `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `NEXTAUTH_URL` e `ALLOWED_ORIGIN`.
3. A aplicacao vai rodar migrations automaticamente no `preDeployCommand`.

### Migracao segura dos dados atuais

Exporte um dump do banco atual antes do primeiro deploy em producao:

```bash
docker exec controle_contas_db sh -lc 'exec mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' > backup_controle_contas.sql
```

Depois que o MySQL do Render estiver no ar, envie o arquivo para o shell do servico e importe:

```bash
mysql -h 127.0.0.1 -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < backup_controle_contas.sql
```

### Backups recorrentes

Para evitar perda de dados, gere dumps periodicos com `mysqldump` e armazene-os fora do Render.
