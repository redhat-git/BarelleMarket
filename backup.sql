
--
-- Backup complet de la base de données BARELLE Distribution


-- Désactiver les contraintes pendant l'import
SET session_replication_role = replica;

--
-- Structure de la table: users
--

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id character varying PRIMARY KEY NOT NULL,
    email character varying UNIQUE NOT NULL,
    password character varying, -- Mots de passe hachés
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    profile_image_url character varying,
    provider character varying DEFAULT 'local',
    company_name character varying,
    company_type character varying,
    siret character varying,
    rccm character varying,
    address text,
    city character varying,
    phone character varying,
    second_contact_name character varying,
    second_contact_phone character varying,
    is_b2b boolean DEFAULT false,
    is_active boolean DEFAULT true,
    role character varying DEFAULT 'user',
    permissions jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

--
-- Structure de la table: sessions
--

DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE sessions (
    sid character varying PRIMARY KEY NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
    id serial PRIMARY KEY,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL UNIQUE,
    description text,
    image_url character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);

--
-- Structure de la table: products
--

DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
    id serial PRIMARY KEY,
    name character varying(200) NOT NULL,
    slug character varying(200) NOT NULL UNIQUE,
    description text,
    short_description character varying(300),
    price numeric(10,2) NOT NULL,
    b2b_price numeric(10,2),
    original_price numeric(10,2),
    category_id integer,
    image_url character varying,
    additional_images jsonb,
    specifications jsonb,
    stock_quantity integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    rating numeric(2,1) DEFAULT 0.0,
    review_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
--
-- Structure des autres tables
--

DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;

CREATE TABLE cart_items (
    id serial PRIMARY KEY,
    session_id character varying NOT NULL,
    user_id character varying,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE orders (
    id serial PRIMARY KEY,
    order_number character varying(50) NOT NULL UNIQUE,
    customer_name character varying,
    customer_email character varying,
    customer_phone character varying,
    user_id character varying,
    delivery_address text NOT NULL,
    delivery_city character varying NOT NULL,
    delivery_district character varying,
    subtotal numeric(10,2) NOT NULL,
    delivery_fee numeric(10,2) DEFAULT 0.00,
    total numeric(10,2) NOT NULL,
    payment_method character varying NOT NULL,
    payment_status character varying DEFAULT 'pending',
    order_status character varying DEFAULT 'pending',
    notes text,
    customer_type character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE order_items (
    id serial PRIMARY KEY,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    product_name character varying NOT NULL,
    product_price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    subtotal numeric(10,2) NOT NULL
);

--
-- Contraintes et index
--

ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE cart_items ADD CONSTRAINT cart_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE orders ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE products ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES categories(id);

CREATE INDEX IDX_session_expire ON sessions USING btree (expire);

--
-- Séquences
--

SELECT pg_catalog.setval('categories_id_seq', 4, true);
SELECT pg_catalog.setval('products_id_seq', 2, true);

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;
-- Fin du script de sauvegarde
