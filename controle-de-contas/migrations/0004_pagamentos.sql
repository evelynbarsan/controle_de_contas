CREATE TABLE IF NOT EXISTS pagamentos (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conta_id           INT UNSIGNED NOT NULL,
  ano                SMALLINT NOT NULL,
  mes                TINYINT NOT NULL,
  valor_pago         DECIMAL(12,2) NOT NULL,
  num_parcelas_pagas INT NOT NULL DEFAULT 1,
  criado_em          DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pagamento (conta_id, ano, mes),
  FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
