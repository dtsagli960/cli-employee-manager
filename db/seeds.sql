INSERT INTO department (name)
VALUES ('Engineering'),
    ('Finance'),
    ('HR');
INSERT INTO "role" (title, salary, department)
VALUES ('Software Engineer', 80000, 1),
    ('Accountant', 60000, 2),
    ('HR Manager', 70000, 3);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Alice', 'Smith', 1, NULL),
    ('Bob', 'Jones', 2, NULL);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Charlie', 'Brown', 3, 1);