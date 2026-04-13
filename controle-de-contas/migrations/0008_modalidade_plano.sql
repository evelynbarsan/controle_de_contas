ALTER TABLE contas
  MODIFY COLUMN modalidade ENUM('compra','divida','refinanciamento','investimento','emprestimo','plano') NOT NULL;
