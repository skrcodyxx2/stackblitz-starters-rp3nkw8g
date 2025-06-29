# Guide de Dépannage - Dounie Cuisine Pro

## 🔧 Table des Matières

1. [Problèmes Courants](#problèmes-courants)
2. [Erreurs d'Authentification](#erreurs-dauthentification)
3. [Problèmes de Base de Données](#problèmes-de-base-de-données)
4. [Erreurs de Performance](#erreurs-de-performance)
5. [Problèmes d'Interface](#problèmes-dinterface)
6. [Débogage](#débogage)

## 🚨 Problèmes Courants

### Application ne se lance pas

**Symptômes**: Erreur au démarrage, page blanche, erreurs de console

**Solutions**:
1. **Vérifier les dépendances**
   ```bash
   npm install
   npm audit fix
   ```

2. **Vérifier les variables d'environnement**
   ```bash
   # Vérifier que .env existe et contient :
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

3. **Nettoyer le cache**
   ```bash
   npm run build
   rm -rf node_modules
   npm install
   ```

4. **Vérifier la version Node.js**
   ```bash
   node --version  # Doit être >= 18
   ```

### Erreurs de compilation TypeScript

**Symptômes**: Erreurs de types, imports non résolus

**Solutions**:
1. **Vérifier les imports**
   ```typescript
   // ✅ Correct
   import { supabase } from '../lib/supabase';
   
   // ❌ Incorrect
   import { supabase } from './lib/supabase';
   ```

2. **Régénérer les types**
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
   ```

3. **Vérifier tsconfig.json**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"]
       }
     }
   }
   ```

### Problèmes de routage

**Symptômes**: 404 sur les routes, navigation cassée

**Solutions**:
1. **Vérifier React Router**
   ```typescript
   // App.tsx doit être wrappé dans BrowserRouter
   <BrowserRouter>
     <App />
   </BrowserRouter>
   ```

2. **Configuration serveur**
   ```javascript
   // vite.config.ts
   export default defineConfig({
     // ... autres configs
     server: {
       historyApiFallback: true
     }
   });
   ```

## 🔐 Erreurs d'Authentification

### Impossible de se connecter

**Symptômes**: Erreur "Invalid login credentials"

**Diagnostic**:
```typescript
// Vérifier la configuration Supabase
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Solutions**:
1. **Vérifier les credentials**
   - Email correct et confirmé
   - Mot de passe respectant les critères

2. **Vérifier la configuration Supabase**
   - URL et clé API correctes
   - Projet Supabase actif

3. **Vérifier les politiques RLS**
   ```sql
   -- Vérifier que les politiques permettent la lecture
   SELECT * FROM auth.users WHERE email = 'user@example.com';
   ```

### Session expirée

**Symptômes**: Déconnexion automatique, erreurs 401

**Solutions**:
1. **Refresh automatique**
   ```typescript
   // Dans AuthContext
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       async (event, session) => {
         if (event === 'TOKEN_REFRESHED') {
           console.log('Token refreshed');
         }
       }
     );
     return () => subscription.unsubscribe();
   }, []);
   ```

2. **Gestion des erreurs 401**
   ```typescript
   const handleApiError = (error: any) => {
     if (error.status === 401) {
       signOut();
       navigate('/connexion');
     }
   };
   ```

### Problèmes de permissions

**Symptômes**: Erreur "Insufficient permissions"

**Solutions**:
1. **Vérifier le rôle utilisateur**
   ```typescript
   const { profile } = useAuth();
   console.log('User role:', profile?.role);
   ```

2. **Vérifier les politiques RLS**
   ```sql
   -- Exemple de politique pour les admins
   CREATE POLICY "Admins can manage all profiles" ON profiles
   FOR ALL TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM profiles 
       WHERE id = auth.uid() AND role = 'admin'
     )
   );
   ```

## 🗄️ Problèmes de Base de Données

### Erreurs de connexion Supabase

**Symptômes**: "Failed to fetch", timeouts

**Diagnostic**:
```typescript
// Test de connexion
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('DB Error:', error);
    } else {
      console.log('DB Connected:', data);
    }
  } catch (err) {
    console.error('Network Error:', err);
  }
};
```

**Solutions**:
1. **Vérifier le statut Supabase**
   - Consulter [status.supabase.com](https://status.supabase.com)

2. **Vérifier les quotas**
   - Limite de requêtes atteinte
   - Limite de stockage

3. **Vérifier la configuration réseau**
   - Firewall/proxy bloquant
   - DNS résolution

### Erreurs de requêtes

**Symptômes**: "Column does not exist", "Table not found"

**Solutions**:
1. **Vérifier le schéma**
   ```sql
   -- Lister les tables
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- Lister les colonnes
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'menu_items';
   ```

2. **Vérifier les migrations**
   ```bash
   # Appliquer les migrations manquantes
   supabase db push
   ```

3. **Synchroniser les types**
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID
   ```

### Problèmes de performance

**Symptômes**: Requêtes lentes, timeouts

**Solutions**:
1. **Ajouter des index**
   ```sql
   -- Index sur les colonnes fréquemment filtrées
   CREATE INDEX idx_orders_customer_id ON orders(customer_id);
   CREATE INDEX idx_menu_items_category ON menu_items(category_id);
   ```

2. **Optimiser les requêtes**
   ```typescript
   // ❌ Éviter les select *
   const { data } = await supabase
     .from('menu_items')
     .select('*');
   
   // ✅ Sélectionner uniquement les colonnes nécessaires
   const { data } = await supabase
     .from('menu_items')
     .select('id, name, price, image_url');
   ```

3. **Utiliser la pagination**
   ```typescript
   const { data } = await supabase
     .from('orders')
     .select('*')
     .range(0, 24)  // 25 éléments par page
     .order('created_at', { ascending: false });
   ```

## ⚡ Erreurs de Performance

### Application lente

**Diagnostic**:
```typescript
// Mesurer les performances
console.time('Menu Load');
const menuData = await fetchMenuData();
console.timeEnd('Menu Load');
```

**Solutions**:
1. **Lazy loading des composants**
   ```typescript
   const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
   ```

2. **Optimisation des images**
   ```typescript
   // Utiliser des URLs optimisées
   const optimizedImageUrl = `${imageUrl}?w=400&h=300&fit=crop`;
   ```

3. **Cache des données**
   ```typescript
   // Utiliser React Query ou SWR
   const { data, error } = useSWR('menu-items', fetchMenuItems);
   ```

### Mémoire élevée

**Solutions**:
1. **Nettoyer les event listeners**
   ```typescript
   useEffect(() => {
     const subscription = supabase.auth.onAuthStateChange(callback);
     return () => subscription.unsubscribe();
   }, []);
   ```

2. **Éviter les re-renders inutiles**
   ```typescript
   const MemoizedComponent = memo(({ data }) => {
     return <div>{data.name}</div>;
   });
   ```

## 🎨 Problèmes d'Interface

### Styles cassés

**Symptômes**: CSS non appliqué, layout cassé

**Solutions**:
1. **Vérifier Tailwind**
   ```bash
   # Régénérer les styles
   npm run build
   ```

2. **Vérifier les classes**
   ```typescript
   // ✅ Classes Tailwind valides
   className="bg-primary-600 text-white"
   
   // ❌ Classes inexistantes
   className="bg-primary-650 text-white"
   ```

3. **Purge CSS**
   ```javascript
   // tailwind.config.js
   module.exports = {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     // ...
   };
   ```

### Responsive cassé

**Solutions**:
1. **Vérifier les breakpoints**
   ```typescript
   // ✅ Ordre correct
   className="text-sm md:text-base lg:text-lg"
   
   // ❌ Ordre incorrect
   className="lg:text-lg text-sm md:text-base"
   ```

2. **Tester sur différents écrans**
   ```bash
   # Utiliser les dev tools pour tester
   # Breakpoints Tailwind : sm(640px), md(768px), lg(1024px), xl(1280px)
   ```

### Icônes manquantes

**Solutions**:
1. **Vérifier les imports**
   ```typescript
   import { User, Settings, LogOut } from 'lucide-react';
   ```

2. **Vérifier la version**
   ```bash
   npm list lucide-react
   npm update lucide-react
   ```

## 🐛 Débogage

### Outils de débogage

1. **Console du navigateur**
   ```typescript
   // Logs détaillés
   console.group('API Call');
   console.log('Request:', request);
   console.log('Response:', response);
   console.groupEnd();
   ```

2. **React Developer Tools**
   - Installer l'extension Chrome/Firefox
   - Inspecter les props et state

3. **Supabase Dashboard**
   - Logs en temps réel
   - Métriques de performance
   - Requêtes SQL

### Logs utiles

```typescript
// AuthContext debugging
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    console.log('Auth state changed:', { user, loading });
  }, [user, loading]);
  
  // ...
};

// API debugging
const apiCall = async () => {
  try {
    console.log('Making API call...');
    const { data, error } = await supabase.from('table').select();
    
    if (error) {
      console.error('API Error:', error);
      throw error;
    }
    
    console.log('API Success:', data);
    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    throw err;
  }
};
```

### Checklist de débogage

- [ ] Vérifier la console pour les erreurs
- [ ] Vérifier les variables d'environnement
- [ ] Tester la connexion Supabase
- [ ] Vérifier les permissions utilisateur
- [ ] Valider les données d'entrée
- [ ] Tester en mode incognito
- [ ] Vérifier sur différents navigateurs
- [ ] Consulter les logs Supabase

### Outils de monitoring

1. **Sentry** pour les erreurs en production
2. **LogRocket** pour les sessions utilisateur
3. **Google Analytics** pour les métriques d'usage

### Support

Si le problème persiste :

1. **Créer un issue GitHub** avec :
   - Description détaillée
   - Étapes pour reproduire
   - Logs d'erreur
   - Environnement (OS, navigateur, version)

2. **Contacter le support** :
   - Email: support@dounieculisine.ca
   - Include les logs et captures d'écran

---

**Dernière mise à jour**: Mars 2024  
**Version**: 1.0.0