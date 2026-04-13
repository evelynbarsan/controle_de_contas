-- Garante que cada conta possa ter no máximo um pagamento por mês
ALTER TABLE pagamentos
  ADD UNIQUE KEY uq_pagamento_mes (conta_id, ano, mes);
