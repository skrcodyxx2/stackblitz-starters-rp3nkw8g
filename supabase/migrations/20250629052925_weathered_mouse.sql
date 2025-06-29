/*
  # Ajout des politiques RLS manquantes

  1. Nouvelles politiques
    - Politiques pour les quotes et quote_items
    - Politiques pour inventory_items
    - Politiques pour financial_transactions
    - Politiques pour loyalty_points
    - Politiques pour announcements
    - Politiques pour media_files
    - Politiques pour audit_logs

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques basées sur les rôles utilisateur
    - Accès restreint selon le contexte métier
*/

-- Politiques pour quotes
CREATE POLICY "Admins and employees can manage all quotes" ON quotes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Users can read own quotes" ON quotes
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Users can create quotes" ON quotes
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Politiques pour quote_items
CREATE POLICY "Admins and employees can manage all quote items" ON quote_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Users can read own quote items" ON quote_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE id = quote_items.quote_id AND customer_id = auth.uid()
    )
  );

-- Politiques pour inventory_items
CREATE POLICY "Admins and employees can manage inventory" ON inventory_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

-- Politiques pour financial_transactions
CREATE POLICY "Only admins can manage financial transactions" ON financial_transactions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour loyalty_points
CREATE POLICY "Admins and employees can manage all loyalty points" ON loyalty_points
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Users can read own loyalty points" ON loyalty_points
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

-- Politiques pour announcements
CREATE POLICY "Admins and employees can manage announcements" ON announcements
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Everyone can read active announcements" ON announcements
  FOR SELECT TO authenticated
  USING (
    is_active = true AND 
    (start_date IS NULL OR start_date <= now()) AND
    (end_date IS NULL OR end_date >= now()) AND
    (target_audience = 'all' OR 
     (target_audience = 'clients' AND EXISTS (
       SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client'
     )) OR
     (target_audience = 'employees' AND EXISTS (
       SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee')
     )) OR
     (target_audience = 'admins' AND EXISTS (
       SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
     ))
    )
  );

-- Politiques pour media_files
CREATE POLICY "Admins and employees can manage media files" ON media_files
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Everyone can read media files" ON media_files
  FOR SELECT TO authenticated
  USING (true);

-- Politiques pour audit_logs
CREATE POLICY "Only admins can read audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fonction pour créer automatiquement un log d'audit
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers d'audit pour les tables importantes
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_orders_trigger
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_reservations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_menu_items_trigger
  AFTER INSERT OR UPDATE OR DELETE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();