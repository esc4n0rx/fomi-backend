// Controller de lojas (COMPLETO e ATUALIZADO)
const StoreService = require('../services/store-service');
const SubscriptionRepository = require('../../billing/repositories/subscription-repository');
const { getAllowedUploads, planHasFeature, getPlanLimits } = require('../../../utils/plan-limits');

class StoreController {
    constructor() {
        this.storeService = new StoreService();
        this.subscriptionRepository = new SubscriptionRepository();
    }

    /**
     * Cria nova loja (primeira etapa - dados básicos apenas)
     */
    createStore = async (req, res, next) => {
        try {
            const store = await this.storeService.createStore(req.user.id, req.body);
            
            res.status(201).json({
                success: true,
                message: 'Loja criada com sucesso',
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Lista lojas do usuário
     */
    getUserStores = async (req, res, next) => {
        try {
            const stores = await this.storeService.getUserStores(req.user.id);
            
            res.json({
                success: true,
                data: { stores }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca loja específica do usuário
     */
    getUserStore = async (req, res, next) => {
        try {
            const store = await this.storeService.getUserStore(req.params.id, req.user.id);
            
            res.json({
                success: true,
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca loja pública por slug
     */
    getPublicStore = async (req, res, next) => {
        try {
            const store = await this.storeService.getPublicStore(req.params.slug);
            
            res.json({
                success: true,
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Atualiza dados básicos da loja
     */
    updateStore = async (req, res, next) => {
        try {
            const store = await this.storeService.updateStore(
                req.params.id,
                req.user.id,
                req.body
            );
            
            res.json({
                success: true,
                message: 'Loja atualizada com sucesso',
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * 🆕 Busca configurações de personalização disponíveis para o usuário
     */
    getCustomizationSettings = async (req, res, next) => {
        try {
            const store = await this.storeService.getUserStore(req.params.id, req.user.id);
            
            // Busca plano atual do usuário
            const subscription = await this.subscriptionRepository.findActiveByUserId(req.user.id);
            const userPlan = subscription?.plano || 'fomi_simples';
            
            // Verifica permissões
            const permissions = {
                logo_upload: planHasFeature(userPlan, 'logo_upload'),
                banner_upload: planHasFeature(userPlan, 'banner_upload'),
                custom_colors: planHasFeature(userPlan, 'custom_colors'),
                custom_fonts: planHasFeature(userPlan, 'custom_fonts'),
                product_images: planHasFeature(userPlan, 'product_images'),
                category_images: planHasFeature(userPlan, 'category_images')
            };

            const limits = getPlanLimits(userPlan);
            const allowedUploads = getAllowedUploads(userPlan);

            // Configurações disponíveis baseadas no plano
            const availableCustomizations = {
                colors: {
                    available: permissions.custom_colors,
                    current: {
                        cor_primaria: store.cor_primaria,
                        cor_secundaria: store.cor_secundaria,
                        cor_texto: store.cor_texto,
                        cor_fundo: store.cor_fundo
                    },
                    options: [
                        { name: 'Cor Primária', key: 'cor_primaria', description: 'Cor principal da loja' },
                        { name: 'Cor Secundária', key: 'cor_secundaria', description: 'Cor para destaques' },
                        { name: 'Cor do Texto', key: 'cor_texto', description: 'Cor dos textos' },
                        { name: 'Cor do Fundo', key: 'cor_fundo', description: 'Cor de fundo da loja' }
                    ]
                },
                fonts: {
                    available: permissions.custom_fonts,
                    current: {
                        fonte_titulo: store.fonte_titulo,
                        fonte_texto: store.fonte_texto
                    },
                    options: [
                        'Arial', 'Helvetica', 'Georgia', 'Times', 
                        'Verdana', 'Roboto', 'Open Sans', 'Lato'
                    ]
                },
                images: {
                    logo: {
                        available: permissions.logo_upload,
                        current_url: store.logo_url,
                        specifications: {
                            dimensions: '100x100 até 512x512px',
                            formats: ['JPEG', 'PNG', 'WebP'],
                            max_size: '2MB'
                        }
                    },
                    banner: {
                        available: permissions.banner_upload,
                        current_url: store.banner_url,
                        specifications: {
                            dimensions: '800x200 até 1920x600px',
                            formats: ['JPEG', 'PNG', 'WebP'],
                            max_size: '5MB'
                        }
                    }
                }
            };

            // Mensagens de upgrade
            const upgradeMessages = {
                banner_upload: 'Faça upgrade para adicionar um banner personalizado',
                custom_colors: 'Faça upgrade para personalizar as cores da sua loja',
                custom_fonts: 'Faça upgrade para escolher fontes personalizadas',
                product_images: 'Faça upgrade para adicionar imagens aos produtos',
                category_images: 'Faça upgrade para adicionar imagens às categorias'
            };

            res.json({
                success: true,
                data: {
                    store: {
                        id: store.id,
                        nome: store.nome,
                        slug: store.slug,
                        logo_url: store.logo_url,
                        banner_url: store.banner_url,
                        cor_primaria: store.cor_primaria,
                        cor_secundaria: store.cor_secundaria,
                        cor_texto: store.cor_texto,
                        cor_fundo: store.cor_fundo,
                        fonte_titulo: store.fonte_titulo,
                        fonte_texto: store.fonte_texto
                    },
                    user_plan: userPlan,
                    permissions,
                    limits,
                    allowed_uploads: allowedUploads,
                    available_customizations: availableCustomizations,
                    upgrade_required: userPlan === 'fomi_simples',
                    upgrade_messages: upgradeMessages
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Faz upload do logo da loja
     */
    uploadLogo = async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Imagem do logo é obrigatória'
                });
            }

            const store = await this.storeService.uploadLogo(
                req.params.id,
                req.user.id,
                req.file.buffer
            );
            
            res.json({
                success: true,
                message: 'Logo atualizado com sucesso',
                data: { 
                    store,
                    logo_url: store.logo_url
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Faz upload do banner da loja
     */
    uploadBanner = async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Imagem do banner é obrigatória'
                });
            }

            const store = await this.storeService.uploadBanner(
                req.params.id,
                req.user.id,
                req.file.buffer
            );
            
            res.json({
                success: true,
                message: 'Banner atualizado com sucesso',
                data: { 
                    store,
                    banner_url: store.banner_url
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Atualiza personalização visual da loja (segunda etapa)
     */
    updateCustomization = async (req, res, next) => {
        try {
            const store = await this.storeService.updateCustomization(
                req.params.id,
                req.user.id,
                req.body
            );
            
            res.json({
                success: true,
                message: 'Personalização atualizada com sucesso',
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Remove logo da loja
     */
    removeLogo = async (req, res, next) => {
        try {
            const store = await this.storeService.removeLogo(
                req.params.id,
                req.user.id
            );
            
            res.json({
                success: true,
                message: 'Logo removido com sucesso',
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Remove banner da loja
     */
    removeBanner = async (req, res, next) => {
        try {
            const store = await this.storeService.removeBanner(
                req.params.id,
                req.user.id
            );
            
            res.json({
                success: true,
                message: 'Banner removido com sucesso',
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * 🆕 Preview da loja com personalizações
     */
    previewCustomization = async (req, res, next) => {
        try {
            const store = await this.storeService.getUserStore(req.params.id, req.user.id);
            
            // Aplica personalizações temporárias para preview
            const previewData = {
                ...store,
                ...req.body // Sobrescreve com dados do preview
            };

            res.json({
                success: true,
                message: 'Preview gerado com sucesso',
                data: { 
                    preview: previewData,
                    is_preview: true
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * 🆕 Reset personalização para padrões
     */
    resetCustomization = async (req, res, next) => {
        try {
            const defaultCustomization = {
                cor_primaria: '#FF6B35',
                cor_secundaria: '#F7931E',
                cor_texto: '#333333',
                cor_fundo: '#FFFFFF',
                fonte_titulo: 'Roboto',
                fonte_texto: 'Roboto'
            };

            const store = await this.storeService.updateCustomization(
                req.params.id,
                req.user.id,
                defaultCustomization
            );
            
            res.json({
                success: true,
                message: 'Personalização resetada para os padrões',
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * 🆕 Busca templates de personalização prontos
     */
    getCustomizationTemplates = async (req, res, next) => {
        try {
            // Busca plano do usuário para verificar se tem acesso
            const subscription = await this.subscriptionRepository.findActiveByUserId(req.user.id);
            const userPlan = subscription?.plano || 'fomi_simples';
            
            const hasCustomColors = planHasFeature(userPlan, 'custom_colors');
            const hasCustomFonts = planHasFeature(userPlan, 'custom_fonts');

            const templates = [
                {
                    id: 'moderno',
                    name: 'Moderno',
                    description: 'Design clean e minimalista',
                    preview_image: '/templates/moderno.jpg',
                    available: hasCustomColors && hasCustomFonts,
                    customization: {
                        cor_primaria: '#2563EB',
                        cor_secundaria: '#1D4ED8',
                        cor_texto: '#1F2937',
                        cor_fundo: '#FFFFFF',
                        fonte_titulo: 'Roboto',
                        fonte_texto: 'Open Sans'
                    }
                },
                {
                    id: 'elegante',
                    name: 'Elegante',
                    description: 'Sofisticado e profissional',
                    preview_image: '/templates/elegante.jpg',
                    available: hasCustomColors && hasCustomFonts,
                    customization: {
                        cor_primaria: '#1F2937',
                        cor_secundaria: '#374151',
                        cor_texto: '#111827',
                        cor_fundo: '#F9FAFB',
                        fonte_titulo: 'Georgia',
                        fonte_texto: 'Arial'
                    }
                },
                {
                    id: 'vibrante',
                    name: 'Vibrante',
                    description: 'Cores vivas e chamativas',
                    preview_image: '/templates/vibrante.jpg',
                    available: hasCustomColors && hasCustomFonts,
                    customization: {
                        cor_primaria: '#EF4444',
                        cor_secundaria: '#F97316',
                        cor_texto: '#1F2937',
                        cor_fundo: '#FFFFFF',
                        fonte_titulo: 'Lato',
                        fonte_texto: 'Verdana'
                    }
                },
                {
                    id: 'natural',
                    name: 'Natural',
                    description: 'Inspirado na natureza',
                    preview_image: '/templates/natural.jpg',
                    available: hasCustomColors && hasCustomFonts,
                    customization: {
                        cor_primaria: '#059669',
                        cor_secundaria: '#10B981',
                        cor_texto: '#1F2937',
                        cor_fundo: '#F0FDF4',
                        fonte_titulo: 'Open Sans',
                        fonte_texto: 'Helvetica'
                    }
                }
            ];

            res.json({
                success: true,
                data: {
                    templates,
                    user_plan: userPlan,
                    templates_available: hasCustomColors && hasCustomFonts,
                    upgrade_message: !hasCustomColors ? 'Faça upgrade para usar templates personalizados' : null
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * 🆕 Aplica template de personalização
     */
    applyCustomizationTemplate = async (req, res, next) => {
        try {
            const { templateId } = req.body;
            
            if (!templateId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do template é obrigatório'
                });
            }

            // Templates disponíveis (mesmo do método anterior)
            const templates = {
                moderno: {
                    cor_primaria: '#2563EB',
                    cor_secundaria: '#1D4ED8',
                    cor_texto: '#1F2937',
                    cor_fundo: '#FFFFFF',
                    fonte_titulo: 'Roboto',
                    fonte_texto: 'Open Sans'
                },
                elegante: {
                    cor_primaria: '#1F2937',
                    cor_secundaria: '#374151',
                    cor_texto: '#111827',
                    cor_fundo: '#F9FAFB',
                    fonte_titulo: 'Georgia',
                    fonte_texto: 'Arial'
                },
                vibrante: {
                    cor_primaria: '#EF4444',
                    cor_secundaria: '#F97316',
                    cor_texto: '#1F2937',
                    cor_fundo: '#FFFFFF',
                    fonte_titulo: 'Lato',
                    fonte_texto: 'Verdana'
                },
                natural: {
                    cor_primaria: '#059669',
                    cor_secundaria: '#10B981',
                    cor_texto: '#1F2937',
                    cor_fundo: '#F0FDF4',
                    fonte_titulo: 'Open Sans',
                    fonte_texto: 'Helvetica'
                }
            };

            const templateCustomization = templates[templateId];
            
            if (!templateCustomization) {
                return res.status(400).json({
                    success: false,
                    message: 'Template não encontrado'
                });
            }

            const store = await this.storeService.updateCustomization(
                req.params.id,
                req.user.id,
                templateCustomization
            );
            
            res.json({
                success: true,
                message: `Template "${templateId}" aplicado com sucesso`,
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Desativa loja
     */
    deactivateStore = async (req, res, next) => {
        try {
            await this.storeService.deactivateStore(req.params.id, req.user.id);
            
            res.json({
                success: true,
                message: 'Loja desativada com sucesso'
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = StoreController;