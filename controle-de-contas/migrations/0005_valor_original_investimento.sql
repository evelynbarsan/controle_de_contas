-- Adiciona valor_original (o que a pessoa devia originalmente antes de juros)
ALTER TABLE contas
  ADD COLUMN valor_original DECIMAL(12,2) NULL AFTER fim_pagamento;

-- Adiciona modalidade investimento
ALTER TABLE contas
  MODIFY COLUMN modalidade ENUM('compra','divida','refinanciamento','investimento') NOT NULL;
