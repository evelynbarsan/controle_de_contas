-- 0002_create_lookup_tables.sql
-- Tabelas de domínio (lookup) referenciadas pela tabela contas.
-- Popule com os valores iniciais via seed após rodar as migrations.

CREATE TABLE IF NOT EXISTS tipo_conta (
  id    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(100) NOT NULL UNIQUE  -- ex: Supermercado, Educação, Telefonia...
);

CREATE TABLE IF NOT EXISTS fonte (
  id    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(100) NOT NULL UNIQUE  -- ex: Cartão X, Cartão Y, Em mãos...
);

CREATE TABLE IF NOT EXISTS frequencia (
  id    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(50)  NOT NULL UNIQUE  -- ex: Fixo, Temporário, Pontual
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

