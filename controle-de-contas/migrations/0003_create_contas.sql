-- 0003_create_contas.sql

CREATE TABLE IF NOT EXISTS contas (
  id                INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  usuario_id        INT              NOT NULL,
  tipo_conta_id     TINYINT UNSIGNED NOT NULL,
  fonte_id          TINYINT UNSIGNED NOT NULL,
  frequencia_id     TINYINT UNSIGNED NOT NULL,
  titulo            VARCHAR(255)     NOT NULL,
  modalidade        ENUM('compra','divida','refinanciamento') NOT NULL,
  num_parcelas      SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  valor_total       DECIMAL(10,2)    NOT NULL,
  valor_unitario    DECIMAL(10,2)    NOT NULL,
  inicio_pagamento  DATE             NOT NULL,
  fim_pagamento     DATE             NULL,      
  observacao        TEXT             NULL,

  created_at        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Chaves estrangeiras
  CONSTRAINT fk_contas_usuario
    FOREIGN KEY (usuario_id)    REFERENCES users(id)       ON DELETE CASCADE,
  CONSTRAINT fk_contas_tipo
    FOREIGN KEY (tipo_conta_id) REFERENCES tipo_conta(id)  ON DELETE RESTRICT,
  CONSTRAINT fk_contas_fonte
    FOREIGN KEY (fonte_id)      REFERENCES fonte(id)       ON DELETE RESTRICT,
  CONSTRAINT fk_contas_frequencia
    FOREIGN KEY (frequencia_id) REFERENCES frequencia(id)  ON DELETE RESTRICT,

  INDEX idx_contas_usuario   (usuario_id),
  INDEX idx_contas_tipo      (tipo_conta_id),
  INDEX idx_contas_fonte     (fonte_id),
  INDEX idx_contas_frequencia (frequencia_id)
);

