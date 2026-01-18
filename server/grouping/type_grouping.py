from collections import defaultdict

def group_items_by_type(data: list) -> defaultdict:
    """
        group board items by type
        return: {'type': [item, ..]}
    """
    type_map = defaultdict(list)
    for item in data:
        type = item.get('type', "type not defined")
        type_map[type].append(item)

    return type_map
