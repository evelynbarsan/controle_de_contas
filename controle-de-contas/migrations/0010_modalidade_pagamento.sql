-- Adiciona 'pagamento' ao enum de modalidade (entradas que subtraem do total)
ALTER TABLE contas
  MODIFY COLUMN modalidade ENUM(
    'compra', 'divida', 'refinanciamento',
    'investimento', 'emprestimo', 'plano', 'pagamento'
  ) NOT NULL;
