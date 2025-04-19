/**
 * Handler functions for VPCGraph actions.
 */

export const handleButtonClick = async (
    name: string,
    fetchFunction: (() => Promise<any>) | undefined,
    selectedAccountId: string,
    setSelectedView: (view: string) => void,
    setLastUpdated: (date: Date) => void,
    setIsModalOpen: (open: boolean) => void,
    setSelectedAccountId: (id: string) => void
  ) => {
    // Close modal if open, set selected view and update last updated timestamp.
    setIsModalOpen(false);
    setSelectedAccountId(selectedAccountId);
    setSelectedView(name);
    setLastUpdated(new Date());
    // Execute additional fetch action if provided.
    if (fetchFunction) {
      await fetchFunction();
    }
  };
  
  export const handleOpenModal = (
    item: any,
    setSelectedItem: (item: any) => void,
    setIsModalOpen: (open: boolean) => void
  ) => {
    // Set the item and open modal
    setSelectedItem(item);
    setIsModalOpen(true);
  };