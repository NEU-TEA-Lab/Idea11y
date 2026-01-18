from collections import defaultdict

def group_sticky_notes_by_color(data: list) -> defaultdict:
    """
        group sticky notes by color
        return: {'color': [item, ..]}
        item type: BoardNode
    """
    color_map = defaultdict(list)
    for item in data:
        color = item.get('style', {}).get('fillColor')
        if color:
            color_map[color].append(item)
    return color_map
