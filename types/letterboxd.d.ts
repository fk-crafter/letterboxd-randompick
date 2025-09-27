declare module "letterboxd" {
  export default class Letterboxd {
    userWatchlist(username: string): Promise<
      {
        name: string;
        link: string;
        image: string;
      }[]
    >;
  }
}
