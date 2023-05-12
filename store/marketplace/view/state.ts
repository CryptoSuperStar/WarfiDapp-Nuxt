
export enum ViewType {
  Latest,
  MyNFTs,
  AscValue,
  DescValue,
  ExpiringSoon
}

const state = () => ({
  filter: '' as string,
  viewType: ViewType.Latest,
  featureFilter : '' as string,
  typeFilter : '' as string
});

export default state;
export type State = ReturnType<typeof state>;
