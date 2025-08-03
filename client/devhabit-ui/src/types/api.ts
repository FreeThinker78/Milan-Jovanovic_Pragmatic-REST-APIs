export interface Link {
  href: string;
  rel: string;
  method: string;
}

export interface HateoasResponse {
  links: Link[];
}
