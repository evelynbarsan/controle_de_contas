FROM mysql:8.4

COPY config/mysql.cnf /etc/mysql/conf.d/hardening.cnf
