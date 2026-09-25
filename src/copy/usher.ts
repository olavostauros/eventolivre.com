/* Every string the Usher PWA shows. Brazilian Portuguese only: the app is
   one shell at /usher/ for attendees in Brazil (decision 0006). Event text
   never lives here; it is data from the API at runtime. Platform names are
   data too. tests/copy.test.ts fails on an empty value. */

export interface UsherCopy {
  readonly meta: {
    readonly title: string;
    readonly description: string;
    readonly appName: string;
    readonly by: string;
  };
  readonly holding: {
    readonly title: string;
    readonly body: string;
    readonly back: string;
  };
  readonly nav: {
    readonly skipToContent: string;
    readonly home: string;
    readonly themeLabel: string;
    readonly themeToLight: string;
    readonly themeToDark: string;
  };
  readonly place: {
    readonly label: string;
    readonly choose: string;
    readonly nearMe: string;
    readonly locating: string;
    readonly nearYou: string;
    readonly radius: string;
    readonly change: string;
    readonly denied: string;
    readonly unavailable: string;
    readonly cityCount: string;
  };
  readonly filters: {
    readonly search: string;
    readonly searchPlaceholder: string;
    readonly free: string;
    readonly allCategories: string;
    readonly categories: string;
    readonly clear: string;
  };
  readonly list: {
    readonly loading: string;
    readonly empty: string;
    readonly more: string;
    readonly end: string;
    readonly retry: string;
    readonly moreSessions: string;
    readonly online: string;
    readonly free: string;
    readonly upTo: string;
    readonly from: string;
    readonly noPrice: string;
    readonly away: string;
  };
  readonly detail: {
    readonly back: string;
    readonly loading: string;
    readonly buy: string;
    readonly buyAt: string;
    readonly organizer: string;
    readonly prices: string;
    readonly address: string;
    readonly onlineEvent: string;
    readonly ends: string;
    readonly updated: string;
    readonly gone: string;
    readonly goneCancelled: string;
    readonly goneEnded: string;
    readonly goneRemoved: string;
    readonly notFound: string;
  };
  readonly errors: {
    readonly offline: string;
    readonly rateLimited: string;
    readonly unavailable: string;
    readonly invalid: string;
    readonly unknown: string;
  };
  readonly footer: {
    readonly sourcesNote: string;
    readonly privacy: string;
  };
  readonly externalLabel: string;
}

export const usherPtBR: UsherCopy = {
  meta: {
    title: "Usher",
    description: "Eventos perto de você, de várias plataformas, em uma lista só. Usher, da Evento Livre.",
    appName: "Usher",
    by: "da Evento Livre",
  },
  holding: {
    title: "O Usher ainda não abriu.",
    body: "Estamos preparando a primeira versão. Enquanto isso, a página da Evento Livre conta o que ele vai fazer.",
    back: "Voltar para a Evento Livre",
  },
  nav: {
    skipToContent: "Ir para o conteúdo",
    home: "Evento Livre",
    themeLabel: "Tema",
    themeToLight: "Usar tema claro",
    themeToDark: "Usar tema escuro",
  },
  place: {
    label: "Onde",
    choose: "Escolha uma cidade",
    nearMe: "Usar minha posição",
    locating: "Localizando…",
    nearYou: "Perto de você",
    radius: "Raio",
    change: "Trocar",
    denied: "Sem permissão para usar sua posição. Escolha uma cidade.",
    unavailable: "Não deu para encontrar sua posição. Escolha uma cidade.",
    cityCount: "eventos",
  },
  filters: {
    search: "Buscar",
    searchPlaceholder: "Nome do evento",
    free: "Só grátis",
    allCategories: "Todas",
    categories: "Categorias",
    clear: "Limpar filtros",
  },
  list: {
    loading: "Procurando eventos…",
    empty: "Nenhum evento encontrado com esses filtros.",
    more: "Carregar mais",
    end: "Isso é tudo por enquanto.",
    retry: "Tentar de novo",
    moreSessions: "e mais {n} sessões",
    online: "Online",
    free: "Grátis",
    upTo: "até",
    from: "a partir de",
    noPrice: "Preço no site da venda",
    away: "de distância",
  },
  detail: {
    back: "Voltar para a lista",
    loading: "Carregando evento…",
    buy: "Ingressos",
    buyAt: "Comprar em",
    organizer: "Organização",
    prices: "Lotes",
    address: "Endereço",
    onlineEvent: "Evento online",
    ends: "Termina",
    updated: "Atualizado",
    gone: "Este evento não está mais disponível.",
    goneCancelled: "O evento foi cancelado.",
    goneEnded: "O evento já terminou.",
    goneRemoved: "O evento saiu do site da venda.",
    notFound: "Não encontramos esse evento.",
  },
  errors: {
    offline: "Você está sem internet. Mostrando o que já tinha sido carregado.",
    rateLimited: "Muitas buscas em pouco tempo. Espere um instante e tente de novo.",
    unavailable: "O Usher está fora do ar por um momento. Tente de novo em breve.",
    invalid: "Algo nos filtros não fez sentido. Limpe os filtros e tente de novo.",
    unknown: "Não deu para carregar os eventos.",
  },
  footer: {
    sourcesNote: "Os ingressos são vendidos pelas plataformas de origem. O Usher só te leva até elas.",
    privacy: "Sua posição e seus filtros ficam só no seu aparelho.",
  },
  externalLabel: "(abre em nova aba)",
};
