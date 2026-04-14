-- ============================================================
-- 003_seed_data.sql
-- Portal de Carreiras — Welcome Group
-- Dados iniciais para desenvolvimento e demo
-- ============================================================

-- --------------------
-- DEPOIMENTOS
-- --------------------

INSERT INTO testimonials (name, role, brand, quote, is_featured, sort_order, is_visible) VALUES
(
  'Carolina Mendes',
  'Assessora de Casamentos',
  'welcome_weddings',
  'Trabalhar na Welcome Weddings é realizar sonhos todos os dias. Cada casamento é único e eu tenho a liberdade de criar experiências inesquecíveis para os casais. O ambiente é acolhedor e a liderança nos incentiva a crescer sempre.',
  true, 1, true
),
(
  'Rafael Oliveira',
  'Consultor de Viagens',
  'welcome_trips',
  'Entrei como estagiário e hoje lidero uma carteira de clientes premium. A Welcome Trips investe de verdade no desenvolvimento dos consultores — participei de famtours incríveis e treinamentos que mudaram minha visão do mercado.',
  true, 2, true
),
(
  'Juliana Costa',
  'Coordenadora de Eventos',
  'welconnect',
  'O WelConnect me deu a oportunidade de trabalhar com networking em escala internacional. Organizar eventos em Mendoza e Cartagena, conectando profissionais do trade, é desafiador e gratificante ao mesmo tempo.',
  true, 3, true
);


-- --------------------
-- CONTEÚDO DE CULTURA
-- --------------------

INSERT INTO culture_content (section_key, title, content, sort_order, is_visible) VALUES
(
  'manifesto',
  'Por que Welcome',
  '{"text": "No Welcome Group, acreditamos que as melhores jornadas começam com as pessoas certas. Somos um time de apaixonados por turismo, eventos e experiências que transformam. Aqui, cada colaborador é parte essencial de uma história que conecta destinos, sonhos e pessoas. Se você busca um lugar onde seu trabalho tem propósito e impacto real, você é Welcome."}'::jsonb,
  1, true
),
(
  'values',
  'Nossos Valores',
  '{"items": [
    {"icon": "heart", "title": "Paixão pelo que fazemos", "description": "Turismo é mais do que trabalho — é o que nos move. Colocamos coração em cada detalhe."},
    {"icon": "users", "title": "Pessoas em primeiro lugar", "description": "Clientes, parceiros e colegas. Construímos relações genuínas e duradouras."},
    {"icon": "rocket", "title": "Inovação com propósito", "description": "Usamos tecnologia e criatividade para criar experiências cada vez melhores."},
    {"icon": "globe", "title": "Visão global, raiz brasileira", "description": "Operamos em destinos internacionais com a calidez e a energia do Brasil."},
    {"icon": "trending-up", "title": "Crescimento contínuo", "description": "Investimos no desenvolvimento de cada pessoa do time. Crescemos juntos."},
    {"icon": "sparkles", "title": "Excelência nos detalhes", "description": "Do primeiro contato à última entrega, cada detalhe importa."}
  ]}'::jsonb,
  2, true
),
(
  'benefits',
  'Benefícios',
  '{"categories": [
    {"icon": "heart-pulse", "title": "Saúde e Bem-estar", "items": ["Plano de saúde", "Plano odontológico", "Gympass / Wellhub", "Day off no aniversário"]},
    {"icon": "graduation-cap", "title": "Desenvolvimento", "items": ["Treinamentos internos", "Famtours e viagens de estudo", "Participação em eventos do trade", "Programa de mentoria"]},
    {"icon": "home", "title": "Flexibilidade", "items": ["Modelo híbrido (conforme área)", "Horário flexível", "Dress code casual", "Ambiente pet-friendly"]},
    {"icon": "gift", "title": "Extras", "items": ["Vale-refeição/alimentação", "Vale-transporte", "Desconto em viagens Welcome Trips", "Confraternizações e team buildings"]}
  ]}'::jsonb,
  3, true
),
(
  'dei',
  'Diversidade e Inclusão',
  '{"text": "Acreditamos que equipes diversas criam experiências melhores. Buscamos ativamente ampliar a representatividade no nosso time e valorizamos cada perspectiva única que nossos colaboradores trazem."}'::jsonb,
  4, true
);


-- --------------------
-- VAGAS DE EXEMPLO
-- --------------------

INSERT INTO jobs (slug, title, brand, department, location, work_model, contract_type, salary_range, description, responsibilities, requirements_must, requirements_nice, benefits, process_steps, status, is_featured, published_at) VALUES
(
  'assessora-destination-wedding',
  'Assessora de Destination Wedding',
  'welcome_weddings',
  'comercial',
  'Curitiba, PR',
  'hibrido',
  'clt',
  'R$ 4.000 - R$ 6.000',
  '<p>Estamos buscando uma assessora de casamentos apaixonada por criar experiências únicas para casais que sonham com um destination wedding. Você será responsável por acompanhar casais desde o primeiro contato até o grande dia, coordenando fornecedores internacionais e garantindo que cada detalhe esteja perfeito.</p>',
  '<ul><li>Atender casais em todas as etapas do planejamento do destination wedding</li><li>Coordenar fornecedores em destinos internacionais (Mendoza, Cartagena, Europa)</li><li>Elaborar propostas comerciais e orçamentos personalizados</li><li>Acompanhar presencialmente os eventos nos destinos</li><li>Manter CRM atualizado com histórico de interações</li></ul>',
  '<ul><li>Experiência mínima de 2 anos em assessoria de casamentos ou eventos</li><li>Inglês intermediário ou avançado (comunicação com fornecedores internacionais)</li><li>Disponibilidade para viagens internacionais</li><li>Excelente comunicação interpessoal e organização</li><li>Familiaridade com ferramentas digitais (CRM, planilhas, apresentações)</li></ul>',
  '<ul><li>Espanhol</li><li>Experiência com destination weddings</li><li>Carteira de fornecedores internacionais</li><li>Certificações em cerimonial e eventos</li></ul>',
  '<p>Plano de saúde, plano odontológico, VR/VA, vale-transporte, Gympass, day off no aniversário, desconto em viagens Welcome Trips, participação em famtours.</p>',
  '[{"order": 1, "title": "Inscrição", "description": "Envie seu currículo e carta de apresentação"},{"order": 2, "title": "Triagem", "description": "Análise do perfil e experiência"},{"order": 3, "title": "Entrevista", "description": "Conversa com a liderança de Weddings"},{"order": 4, "title": "Case prático", "description": "Simulação de planejamento de um destination wedding"},{"order": 5, "title": "Proposta", "description": "Apresentação da oferta e condições"}]'::jsonb,
  'published',
  true,
  NOW() - INTERVAL '3 days'
),
(
  'consultor-viagens-premium',
  'Consultor(a) de Viagens Premium',
  'welcome_trips',
  'comercial',
  'Curitiba, PR',
  'presencial',
  'clt',
  'R$ 3.500 - R$ 5.500 + comissão',
  '<p>Buscamos um(a) consultor(a) de viagens para atender nossa carteira de clientes premium. Você vai ajudar viajantes a desenhar roteiros exclusivos, negociar com operadoras e garantir experiências memoráveis.</p>',
  '<ul><li>Atender clientes via WhatsApp, telefone e presencialmente</li><li>Montar roteiros personalizados para destinos nacionais e internacionais</li><li>Negociar com operadoras e fornecedores para melhores condições</li><li>Acompanhar pós-venda e garantir satisfação do cliente</li><li>Atingir metas mensais de vendas e faturamento</li></ul>',
  '<ul><li>Experiência mínima de 1 ano em agência de viagens</li><li>Conhecimento de sistemas de reserva (GDS é diferencial)</li><li>Boa comunicação escrita e verbal</li><li>Perfil comercial com foco em resultado</li></ul>',
  '<ul><li>Inglês e/ou espanhol</li><li>Certificação de operadoras (Disney, MSC, etc.)</li><li>Experiência com público premium/alto padrão</li></ul>',
  '<p>Plano de saúde, VR/VA, vale-transporte, comissão sobre vendas, famtours nacionais e internacionais, desconto em viagens pessoais.</p>',
  '[{"order": 1, "title": "Inscrição", "description": "Envie seu currículo"},{"order": 2, "title": "Triagem", "description": "Análise de experiência e perfil"},{"order": 3, "title": "Entrevista", "description": "Conversa com gestão comercial"},{"order": 4, "title": "Proposta", "description": "Apresentação de condições e início"}]'::jsonb,
  'published',
  true,
  NOW() - INTERVAL '5 days'
),
(
  'analista-marketing-digital',
  'Analista de Marketing Digital',
  'corporativo',
  'marketing',
  'Curitiba, PR',
  'hibrido',
  'clt',
  'R$ 4.500 - R$ 7.000',
  '<p>Procuramos um(a) analista de marketing digital para integrar o time de marketing do Welcome Group. Você atuará em campanhas para todas as marcas do grupo, com foco em performance, conteúdo e análise de dados.</p>',
  '<ul><li>Planejar e executar campanhas de mídia paga (Google Ads, Meta Ads)</li><li>Gerenciar calendário editorial e produção de conteúdo para Instagram</li><li>Analisar métricas de performance e gerar relatórios (GA4, Looker Studio)</li><li>Apoiar estratégias de e-mail marketing via ActiveCampaign</li><li>Colaborar com equipe criativa na produção de materiais</li></ul>',
  '<ul><li>Formação em Marketing, Publicidade, Comunicação ou áreas correlatas</li><li>Experiência com Google Ads e Meta Ads (mínimo 2 anos)</li><li>Conhecimento de GA4, Google Tag Manager e Looker Studio</li><li>Capacidade analítica e orientação a dados</li><li>Experiência com gestão de redes sociais</li></ul>',
  '<ul><li>Experiência no setor de turismo ou eventos</li><li>Conhecimento de ferramentas de automação (ActiveCampaign, Make/n8n)</li><li>Noções de SEO e marketing de conteúdo</li><li>Inglês intermediário</li></ul>',
  '<p>Plano de saúde, plano odontológico, VR/VA, vale-transporte, Gympass, day off no aniversário, modelo híbrido, desconto em viagens.</p>',
  '[{"order": 1, "title": "Inscrição", "description": "Envie currículo e portfólio"},{"order": 2, "title": "Triagem", "description": "Análise de perfil e portfólio"},{"order": 3, "title": "Entrevista técnica", "description": "Conversa sobre experiência e cases"},{"order": 4, "title": "Desafio prático", "description": "Análise de campanha ou criação de plano de mídia"},{"order": 5, "title": "Entrevista final", "description": "Conversa com direção"},{"order": 6, "title": "Proposta", "description": "Apresentação da oferta"}]'::jsonb,
  'published',
  true,
  NOW() - INTERVAL '1 day'
),
(
  'produtor-eventos-welconnect',
  'Produtor(a) de Eventos — WelConnect',
  'welconnect',
  'operacoes',
  'Curitiba, PR',
  'hibrido',
  'pj',
  NULL,
  '<p>Estamos montando a equipe para as próximas edições do WelConnect (Cartagena 2026 e além). Buscamos um(a) produtor(a) de eventos com experiência em eventos corporativos e networking, preferencialmente com vivência internacional.</p>',
  '<ul><li>Planejar e executar a logística das edições do WelConnect</li><li>Coordenar fornecedores locais nos destinos (hotelaria, A&B, transfers)</li><li>Gerenciar cronograma, budget e entregas do evento</li><li>Apoiar a comunicação com participantes antes, durante e após o evento</li><li>Produzir relatórios pós-evento com métricas e aprendizados</li></ul>',
  '<ul><li>Experiência mínima de 3 anos em produção de eventos corporativos</li><li>Disponibilidade para viagens internacionais</li><li>Espanhol intermediário ou avançado</li><li>Gestão de orçamento e fornecedores</li><li>Proatividade e capacidade de resolução sob pressão</li></ul>',
  '<ul><li>Inglês intermediário</li><li>Experiência com eventos internacionais</li><li>Conhecimento de ClickUp ou ferramentas de gestão de projetos</li></ul>',
  NULL,
  '[{"order": 1, "title": "Inscrição", "description": "Envie currículo e portfólio de eventos"},{"order": 2, "title": "Entrevista", "description": "Conversa com coordenação de WelConnect"},{"order": 3, "title": "Referências", "description": "Validação de experiências anteriores"},{"order": 4, "title": "Proposta", "description": "Alinhamento de escopo e valores"}]'::jsonb,
  'draft',
  false,
  NULL
);
