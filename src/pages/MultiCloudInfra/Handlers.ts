export const handleButtonClick = async (
    name: string,
    fetchFunction: (() => Promise<any>) | undefined,
    selectedAccountId: string,
    setSelectedView: (view: string) => void,
    setLastUpdated: (date: Date) => void,
    setIsModalOpen: (open: boolean) => void,
    setSelectedAccountId: (id: string) => void
) => {
    setIsModalOpen(false);
    setSelectedAccountId(selectedAccountId);
    setSelectedView(name);
    setLastUpdated(new Date());
    if (fetchFunction) {
        await fetchFunction();
    }
};

export const handleOpenModal = (
    item: any,
    setSelectedItem: (item: any) => void,
    setIsModalOpen: (open: boolean) => void
) => {
    setSelectedItem(item);
    setIsModalOpen(true);
};